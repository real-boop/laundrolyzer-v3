"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BackgroundPaths from "@/components/kokonutui/background-paths"
import { motion } from "framer-motion"
import { toast } from "sonner"
import Dashboard from "@/components/dashboard/dashboard"

interface ScrapeResponse {
  url: string;
  json: any;
  timestamp: string;
}

export default function ResultsPage() {
  const { id } = useParams() as { id: string }
  const [scrapeData, setScrapeData] = useState<ScrapeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from API that gets data from Vercel KV
        const response = await fetch(`/api/get-scrape?id=${id}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch scraped data")
        }
        
        const data = await response.json()
        setScrapeData(data)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Failed to load scraped content")
        toast.error("Failed to load scraped content")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <BackgroundPaths title="Loading" subtle={true}>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg">Loading business data...</p>
          </div>
        </div>
      </BackgroundPaths>
    )
  }

  if (error || !scrapeData) {
    return (
      <BackgroundPaths title="Not Found" subtle={true}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Error</h2>
            <p className="text-red-600 dark:text-red-300">{error || "The requested scraped content could not be found."}</p>
            <div className="mt-4">
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </BackgroundPaths>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Dashboard listingId={id as string} scrapeData={scrapeData} />
    </motion.div>
  )
}
