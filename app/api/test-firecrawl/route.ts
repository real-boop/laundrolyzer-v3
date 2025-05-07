import { NextResponse } from "next/server"
import FirecrawlApp from "@mendable/firecrawl-js"

export async function GET() {
  try {
    const apiKey = process.env.FIRECRAWL_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "FIRECRAWL_API_KEY is not set in environment variables",
        },
        { status: 500 },
      )
    }

    // Initialize the Firecrawl SDK with the API key
    const app = new FirecrawlApp({ apiKey })

    // Test the SDK with a simple status check
    const statusResult = await app.getStatus()

    return NextResponse.json({
      apiKeyProvided: true,
      apiKeyLength: apiKey.length,
      apiKeyFirstChars: apiKey.substring(0, 4) + "...",
      sdkTest: statusResult,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to test Firecrawl API",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

