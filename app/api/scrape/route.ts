import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { v4 as uuidv4 } from "uuid"
import FirecrawlApp from "@mendable/firecrawl-js"

// Define the expected response type
interface FirecrawlResponse {
  success: boolean
  error?: string
  data?: {
    markdown?: string
    json?: any
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      console.error("Missing URL in request body")
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Check if API key is available
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      console.error("Firecrawl API key is not set in environment variables")
      return NextResponse.json(
        {
          error: "Scraping service configuration error",
          details: "API key not configured",
        },
        { status: 500 },
      )
    }

    console.log(`[Firecrawl] Attempting to scrape URL: ${url}`)
    console.log(`[Firecrawl] API Key present: ${!!apiKey}`)

    try {
      // Initialize the Firecrawl SDK with the API key
      const app = new FirecrawlApp({ apiKey })

      // Log the Firecrawl SDK version
      try {
        // Dynamic require to get actual runtime version
        const firecrawlPackage = require('@mendable/firecrawl-js/package.json');
        console.log("[Firecrawl] SDK Version:", firecrawlPackage.version);
      } catch (error) {
        console.log("[Firecrawl] Unable to determine SDK version:", error instanceof Error ? error.message : String(error))
        console.log("[Firecrawl] Note: Please verify @mendable/firecrawl-js is v1.7.0+ in package.json");
      }

      // Using the extract endpoint instead of scrape with JSON format
      console.log("[Firecrawl] Calling extract method with configuration:")
      console.log({
        urls: [url],
        prompt: "You are looking at business listings for sale. Identify and extract all relevant listing information from this page. Formats and content may vary across listings. Generally, there should be a name, location (look across the entire page to find city / ZIP / county or state), business metrics (like price, revenue, and other financials), detailed descriptions. and additional information. Always compile all information from the page pertinent to the listing,"
      })

      const extractResult = await app.extract(
        [url],
        {
          prompt: "You are looking at business listings for sale. Identify and extract all relevant listing information from this page. Formats and content may vary across listings. Generally, there should be a name, location (look across the entire page to find city / ZIP / county or state), business metrics (like price, revenue, and other financials), detailed descriptions. and additional information. Always compile all information from the page pertinent to the listing,"
        }
      ) as FirecrawlResponse

      console.log("[Firecrawl] Response received:", {
        success: extractResult?.success,
        hasData: !!extractResult?.data,
        error: extractResult?.error
      })

      // Check if the extraction was successful
      if (!extractResult || !extractResult.success) {
        const errorMessage = extractResult?.error || "Unknown error from extraction service"
        console.error("[Firecrawl] Error:", {
          message: errorMessage,
          rawResponse: JSON.stringify(extractResult, null, 2)
        })
        return NextResponse.json(
          {
            error: "Failed to extract data from URL",
            details: errorMessage,
          },
          { status: 400 },
        )
      }

      // Generate a unique ID for this extraction
      const id = uuidv4()

      try {
        // Store the extracted data in Vercel KV
        await kv.set(`scrape:${id}`, {
          url,
          data: {
            success: extractResult.success,
            json: extractResult.data // The extracted data is already structured
          },
          timestamp: new Date().toISOString(),
        })
        console.log(`[Vercel KV] Successfully stored extraction result with ID: ${id}`)
      } catch (kvError) {
        console.error("[Vercel KV] Error storing data:", {
          error: kvError instanceof Error ? kvError.message : String(kvError),
          id
        })
        // Continue even if KV storage fails - we can still return the extraction result
      }

      console.log(`[Firecrawl] Successfully extracted data from URL and stored with ID: ${id}`)
      return NextResponse.json({ id })
    } catch (sdkError) {
      console.error("[Firecrawl] SDK error:", {
        error: sdkError instanceof Error ? sdkError.message : String(sdkError),
        stack: sdkError instanceof Error ? sdkError.stack : undefined
      })
      return NextResponse.json(
        {
          error: "Error using extraction service",
          details: sdkError instanceof Error ? sdkError.message : String(sdkError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[API] Unexpected error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      {
        error: "Failed to process URL",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
