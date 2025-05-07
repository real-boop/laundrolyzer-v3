"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-firecrawl")
      const data = await response.json()
      setTestResults(data)
    } catch (err) {
      setError("Failed to run API test")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Firecrawl API Test</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <p className="mb-4">This page tests your Firecrawl API key configuration to help diagnose any issues.</p>
        <Button onClick={runTest} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test API Key"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      {testResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">API Key Information</h3>
            <p>API Key Provided: {testResults.apiKeyProvided ? "Yes" : "No"}</p>
            <p>API Key Length: {testResults.apiKeyLength}</p>
            <p>API Key First Chars: {testResults.apiKeyFirstChars}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Authorization Format Tests</h3>
            {testResults.results?.map((result: any, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h4 className="font-medium">{result.formatName}</h4>
                <p>Status: {result.status}</p>
                <p>Success: {result.ok ? "Yes" : "No"}</p>
                {result.jsonResponse && (
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto">
                    {JSON.stringify(result.jsonResponse, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

