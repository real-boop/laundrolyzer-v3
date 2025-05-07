import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { ScrapeData } from "@/types/scrape"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    console.log("[GET /api/get-scrape] Request received:", { id })

    if (!id) {
      console.error("[GET /api/get-scrape] Missing ID parameter")
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const key = `scrape:${id}`
    console.log("[GET /api/get-scrape] Fetching data from KV:", { key })

    // Explicitly type the KV get operation
    const scrapeData = await kv.get<ScrapeData>(key)
    console.log("[GET /api/get-scrape] Raw KV response:", { scrapeData })

    if (!scrapeData) {
      console.error("[GET /api/get-scrape] Data not found in KV:", { id })
      return NextResponse.json({ error: "Scraped data not found" }, { status: 404 })
    }

    console.log("[GET /api/get-scrape] Successfully retrieved data:", {
      id,
      hasJson: !!scrapeData.data?.json,
      timestamp: scrapeData.timestamp
    })

    // Return JSON data
    return NextResponse.json({
      url: scrapeData.url,
      json: scrapeData.data.json,
      timestamp: scrapeData.timestamp
    })
  } catch (error) {
    console.error("[GET /api/get-scrape] Error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: "Failed to fetch scraped data",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
} 
