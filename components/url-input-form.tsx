"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { toast } from "sonner"

export function UrlInputForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) return

    setIsLoading(true)

    try {
      // Call the real API endpoint instead of using mock data
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to scrape URL")
      }

      const data = await response.json()
      
      // Redirect to the results page
      router.push(`/results/${data.id}`)
    } catch (error) {
      console.error("Error scraping URL:", error)
      toast.error(error instanceof Error ? error.message : "Failed to scrape URL")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full max-w-xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="url"
          placeholder="Paste business listing URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-white/95 dark:bg-black/95 border border-black/10 dark:border-white/10 rounded-xl h-12 px-4 text-base sm:text-lg"
          required
        />

        <Button
          type="submit"
          className="w-full rounded-xl sm:rounded-[1.15rem] px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold backdrop-blur-md 
                    bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                    text-black dark:text-white transition-all duration-300 
                    border border-black/10 dark:border-white/10
                    hover:shadow-md dark:hover:shadow-neutral-800/50"
          disabled={isLoading}
        >
          {isLoading ? "Scraping..." : "Scrape"}
          <span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300">
            →
          </span>
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Optimized for these websites:</p>
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          <div className="text-xs text-gray-700 dark:text-gray-300">BusinessesForSale</div>
          <div className="text-xs text-gray-700 dark:text-gray-300">BizQuest</div>
          <div className="text-xs text-gray-700 dark:text-gray-300">BizBuySell</div>
          <div className="text-xs text-gray-700 dark:text-gray-300">DealStream</div>
        </div>
      </div>
    </motion.div>
  )
}