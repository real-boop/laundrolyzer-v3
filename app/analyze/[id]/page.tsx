"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Dashboard from "@/components/dashboard/dashboard"
import { toast } from "sonner"

export default function AnalyzePage() {
  const { id } = useParams() as { id: string }
  const [scrapeData, setScrapeData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scrapeResponse = await fetch(`/api/get-scrape?id=${id}`)
        if (!scrapeResponse.ok) {
          throw new Error("Failed to fetch scraped data")
        }
        const rawData = await scrapeResponse.json()
        
        // Format the data properly for the dashboard component
        // The dashboard expects data in a specific format with json field
        const formattedData = {
          json: rawData.data?.json || rawData
        }
        
        setScrapeData(formattedData)
        setIsLoading(false)

        // Trigger business score and recommendation analysis in the background
        // to ensure data is ready when dashboard components need it
        fetch("/api/business-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }).catch(err => {
          console.error("Failed to trigger business score analysis:", err)
        })

        fetch("/api/recommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }).catch(err => {
          console.error("Failed to trigger recommendation analysis:", err)
        })

        fetch("/api/demographics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }).catch(err => {
          console.error("Failed to trigger demographics analysis:", err)
        })
      } catch (err) {
        console.error("Error:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setIsLoading(false)
        toast.error("Failed to load data: " + (err instanceof Error ? err.message : "Unknown error"))
      }
    }
    
    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Loading data...</h3>
          <p className="text-gray-500">Please wait while we prepare your dashboard</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md border border-red-200 rounded-lg bg-red-50">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">Error Loading Data</h3>
          <p className="text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return <Dashboard listingId={id} scrapeData={scrapeData} />
}
