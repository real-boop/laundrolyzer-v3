import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Get the analysis data from Vercel KV
    const analysisData = await kv.get(`analysis:${id}`)

    if (!analysisData) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error("Error fetching analysis data:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch analysis data",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}
