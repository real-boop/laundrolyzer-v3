import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    console.log(`[Get Analysis API] Fetching analysis data for ID: ${id}`)

    // Get the analysis data from Vercel KV
    // The data is stored as a hash with fields, so we need to get all fields
    const analysisData = await kv.hgetall(`analysis:${id}`)

    if (!analysisData || Object.keys(analysisData).length === 0) {
      console.log(`[Get Analysis API] No analysis found for ID: ${id}`)
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    console.log(`[Get Analysis API] Successfully retrieved analysis for ID: ${id}`)
    
    return NextResponse.json(analysisData)
  } catch (error) {
    console.error("[Get Analysis API] Error fetching analysis data:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch analysis data",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}
