import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Scrape ID is required" }, { status: 400 })
    }

    console.log(`[Business Score API] Processing request for ID: ${id}`)

    // Check if business score data already exists
    const existingData = await kv.hget(`analysis:${id}`, "businessScoreData")
    if (existingData) {
      console.log(`[Business Score API] Using cached data for ID: ${id}`)
      
      return NextResponse.json({
        id,
        businessScoreData: existingData,
        status: "completed",
        message: "Using cached analysis"
      })
    }

    // Get the scraped data from Vercel KV
    const scrapeData = await kv.get(`scrape:${id}`)

    if (!scrapeData) {
      return NextResponse.json({ error: "Scraped data not found" }, { status: 404 })
    }

    // Safely type the scrapeData as any to avoid TypeScript errors
    const typedScrapeData = scrapeData as any;

    // Extract the content to analyze - use JSON
    const contentToAnalyze = JSON.stringify(typedScrapeData.data?.json, null, 2) || JSON.stringify(scrapeData, null, 2)

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("[Business Score API] OpenAI API key is not set in environment variables")
      return NextResponse.json({ error: "Analysis service configuration error" }, { status: 500 })
    }

    // Get assistant ID from environment variables
    const assistantId = process.env.OPENAI_BUSINESS_SCORE_ASSISTANT_ID
    if (!assistantId) {
      console.error("[Business Score API] OpenAI Business Score Assistant ID is not set in environment variables")
      console.error("[Business Score API] Available env vars:", Object.keys(process.env).filter(key => key.includes('OPENAI')))
      return NextResponse.json({ error: "OpenAI Assistant ID not configured" }, { status: 500 })
    }

    console.log(`[Business Score API] Using OpenAI Assistant ID: ${assistantId.substring(0, 10)}...`)

    try {
      // Create a thread
      console.log("[Business Score API] Creating OpenAI thread...")
      const thread = await openai.beta.threads.create()

      // Add a message to the thread - instruct to output in JSON format
      console.log("[Business Score API] Adding message to thread...")
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Analyze this business listing and return the analysis in JSON. Return ONLY a JSON object with no additional text. Do not include any explanations, introductions or any text outside the JSON structure. Your response should be valid JSON that can be directly parsed: ${contentToAnalyze}`
      })

      // Run the assistant
      console.log("[Business Score API] Running assistant...")
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId
      })

      // Poll for the run to complete
      console.log("[Business Score API] Polling for run completion...")
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)

      // Add timeout to prevent infinite polling
      let attempts = 0
      const maxAttempts = 30 // 30 seconds timeout
      
      while (runStatus.status !== "completed" && attempts < maxAttempts) {
        if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
          throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || "Unknown error"}`)
        }

        // Wait for a second before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000))
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
        attempts++
      }

      if (attempts >= maxAttempts) {
        throw new Error("Analysis timed out")
      }

      // Get the messages
      console.log("[Business Score API] Getting messages...")
      const messages = await openai.beta.threads.messages.list(thread.id)

      // Get the last assistant message
      const assistantMessages = messages.data.filter((msg) => msg.role === "assistant")

      if (assistantMessages.length === 0) {
        throw new Error("No assistant messages found")
      }

      const lastMessage = assistantMessages[0]

      // Extract the content from the message
      let jsonContent = ""
      
      if (lastMessage.content && lastMessage.content.length > 0) {
        const textContent = lastMessage.content.find((item) => item.type === "text")
        if (textContent && "text" in textContent) {
          jsonContent = textContent.text.value
        }
      }

      if (!jsonContent) {
        throw new Error("No text content found in assistant message")
      }
      
      // Log first 50 characters of response to help debug
      console.log(`[Business Score API] Received response (first 50 chars): "${jsonContent.substring(0, 50)}..."`)

      // Try to extract JSON from the response if it's not already JSON
      let extractedJsonContent = jsonContent
      
      // If the content doesn't start with '{', try to find the first '{' and extract from there
      if (!jsonContent.trim().startsWith('{') && !jsonContent.trim().startsWith('[')) {
        console.log("[Business Score API] Response doesn't appear to be JSON format, trying to extract JSON")
        const jsonStartIdx = jsonContent.indexOf('{')
        if (jsonStartIdx >= 0) {
          const possibleJson = jsonContent.substring(jsonStartIdx)
          // Try to find matching closing brace
          let braceCount = 0
          let endIdx = 0
          
          for (let i = 0; i < possibleJson.length; i++) {
            if (possibleJson[i] === '{') braceCount++
            if (possibleJson[i] === '}') braceCount--
            
            if (braceCount === 0 && i > 0) {
              endIdx = i + 1
              break
            }
          }
          
          if (endIdx > 0) {
            extractedJsonContent = possibleJson.substring(0, endIdx)
            console.log("[Business Score API] Extracted JSON-like content:", extractedJsonContent.substring(0, 50) + "...")
          }
        }
      }

      // Parse and validate the JSON response
      try {
        // Replace unicode fancy quotes with regular quotes that can be parsed
        extractedJsonContent = extractedJsonContent
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"')
        
        const parsedJson = JSON.parse(extractedJsonContent)
        
        // Store the business score analysis in Vercel KV
        await kv.hset(`analysis:${id}`, {
          businessScoreData: parsedJson,
          businessScoreTimestamp: new Date().toISOString(),
        })

        console.log(`[Business Score API] Successfully processed business score data for ID: ${id}`)
        
        // Return the business score data result
        return NextResponse.json({
          id,
          businessScoreData: parsedJson,
          status: "completed"
        })
      } catch (jsonError) {
        console.error("[Business Score API] Failed to parse JSON response:", jsonError)
        return NextResponse.json(
          {
            error: "Invalid response format from assistant",
            details: jsonError instanceof Error ? jsonError.message : String(jsonError),
            status: "failed"
          },
          { status: 500 }
        )
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Business Score API] API error:", errorMessage);
      
      return NextResponse.json(
        {
          error: "Error analyzing business score data",
          details: errorMessage,
          status: "failed"
        },
        { status: 500 },
      )
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Business Score API] Error analyzing data:", errorMessage);
    
    return NextResponse.json(
      { 
        error: "Failed to analyze business score data",
        status: "failed"
      }, 
      { status: 500 }
    )
  }
} 
