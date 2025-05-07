"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MarkdownDisplay } from "@/components/markdown-display"
import Link from "next/link"
import { jsPDF } from "jspdf"
import BackgroundPaths from "@/components/kokonutui/background-paths"
import { motion } from "framer-motion"
import { toast } from "sonner"
// Use dynamic import for html2pdf.js to avoid build-time errors

export default function AnalyzePage() {
  const { id } = useParams() as { id: string }

  const [scrapeData, setScrapeData] = useState<any>(null)
  const [businessAnalysis, setBusinessAnalysis] = useState<string | null>(null)
  const [locationDemographics, setLocationDemographics] = useState<string | null>(null)
  const [processedBusinessAnalysis, setProcessedBusinessAnalysis] = useState<string | null>(null)
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true)
  const [isLoadingDemographics, setIsLoadingDemographics] = useState(true)
  const [isAnalyzingBusiness, setIsAnalyzingBusiness] = useState(false)
  const [isAnalyzingDemographics, setIsAnalyzingDemographics] = useState(false)
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [demographicsError, setDemographicsError] = useState<string | null>(null)

  // Fetch business analysis
  useEffect(() => {
    const fetchBusinessAnalysis = async () => {
      try {
        // First check if analysis already exists
        const analysisResponse = await fetch(`/api/get-analysis?id=${id}`)
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          if (analysisData.businessAnalysis) {
            setBusinessAnalysis(analysisData.businessAnalysis)
            setIsLoadingBusiness(false)
            return
          }
        }
        
        // If no analysis exists, get the scraped data
        const scrapeResponse = await fetch(`/api/get-scrape?id=${id}`)
        
        if (!scrapeResponse.ok) {
          throw new Error("Failed to fetch scraped data")
        }
        
        const scrapeData = await scrapeResponse.json()
        setScrapeData(scrapeData)
        
        // Start business analysis process
        setIsAnalyzingBusiness(true)
        const analyzeResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        })
        
        if (!analyzeResponse.ok) {
          const errorData = await analyzeResponse.json()
          throw new Error(errorData.error || "Business analysis failed")
        }
        
        // Get immediate response if available
        const analyzeData = await analyzeResponse.json()
        if (analyzeData.businessAnalysis) {
          setBusinessAnalysis(analyzeData.businessAnalysis)
          setIsAnalyzingBusiness(false)
          setIsLoadingBusiness(false)
          return
        }
        
        // Poll for business analysis results
        let attempts = 0
        const maxAttempts = 30
        const pollInterval = 2000 // 2 seconds
        
        const pollForBusinessResults = async () => {
          if (attempts >= maxAttempts) {
            throw new Error("Business analysis timed out")
          }
          
          attempts++
          
          const pollResponse = await fetch(`/api/get-analysis?id=${id}`)
          
          if (pollResponse.ok) {
            const analysisData = await pollResponse.json()
            if (analysisData.businessAnalysis) {
              setBusinessAnalysis(analysisData.businessAnalysis)
              setIsAnalyzingBusiness(false)
              setIsLoadingBusiness(false)
              return
            }
          }
          
          if (attempts < maxAttempts) {
            // Continue polling
            setTimeout(pollForBusinessResults, pollInterval)
          } else {
            throw new Error("Failed to retrieve business analysis results")
          }
        }
        
        // Start polling
        setTimeout(pollForBusinessResults, pollInterval)
      } catch (err) {
        console.error("Business Analysis Error:", err)
        setBusinessError(err instanceof Error ? err.message : "An unknown error occurred")
        setIsAnalyzingBusiness(false)
        setIsLoadingBusiness(false)
        toast.error("Failed to analyze business: " + (err instanceof Error ? err.message : "Unknown error"))
      }
    }
    
    fetchBusinessAnalysis()
  }, [id])

  // Fetch demographics data separately
  useEffect(() => {
    const fetchDemographicsData = async () => {
      try {
        // First check if demographics data already exists
        const analysisResponse = await fetch(`/api/get-analysis?id=${id}`)
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          if (analysisData.locationDemographics) {
            setLocationDemographics(analysisData.locationDemographics)
            setIsLoadingDemographics(false)
            return
          }
        }
        
        // Start demographics analysis process
        setIsAnalyzingDemographics(true)
        
        // Call the new demographics endpoint
        const demographicsResponse = await fetch("/api/demographics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
          // Use AbortController instead of AbortSignal.timeout for better compatibility
          signal: (() => {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 25000);
            return controller.signal;
          })()
        })
        
        if (!demographicsResponse.ok) {
          if (demographicsResponse.status === 504) {
            throw new Error("Demographics analysis timed out on server")
          }
          const errorData = await demographicsResponse.json().catch(() => ({ error: "Error parsing response" }))
          throw new Error(errorData.error || `Demographics analysis failed (${demographicsResponse.status})`)
        }
        
        // Get immediate response if available
        const demographicsData = await demographicsResponse.json()
        if (demographicsData.locationDemographics) {
          setLocationDemographics(demographicsData.locationDemographics)
          setIsAnalyzingDemographics(false)
          setIsLoadingDemographics(false)
          return
        }
        
        // If demographics data is not yet available, we won't poll for it.
        // The UI will display a message that demographics data is being processed.
        setIsAnalyzingDemographics(false)
        setIsLoadingDemographics(false)
        setDemographicsError("Demographics data could not be retrieved at this time")
      } catch (err) {
        console.error("Demographics Error:", err)
        setDemographicsError(err instanceof Error ? err.message : "An unknown error occurred")
        setIsAnalyzingDemographics(false)
        setIsLoadingDemographics(false)
        
        // Show less intrusive warning for demographics failures
        toast.warning("Demographics data is not available: " + (err instanceof Error ? err.message : "Unknown error"))
      }
    }
    
    // Start fetching demographics only after we've retrieved the business data
    // or after a short delay to avoid overwhelming the server
    const timeoutId = setTimeout(() => {
      fetchDemographicsData()
    }, 2000) // 2 second delay
    
    return () => clearTimeout(timeoutId)
  }, [id])

  // Process business analysis content when it changes
  useEffect(() => {
    if (businessAnalysis) {
      // Check if the content appears to be escaped
      let processed = businessAnalysis;
      
      // Handle potential escaping issues
      // If the content has literal \n, \t, or escaped markdown symbols, fix them
      if (businessAnalysis.includes('\\n') || businessAnalysis.includes('\\#') || 
          businessAnalysis.includes('\\*') || businessAnalysis.includes('\\_')) {
        // Try to fix common escaping issues
        processed = businessAnalysis
          .replace(/\\n/g, '\n')
          .replace(/\\#/g, '#')
          .replace(/\\\*/g, '*')
          .replace(/\\_/g, '_')
          .replace(/\\`/g, '`');
        
        console.log("Fixed escaped markdown characters in business analysis");
      }
      
      setProcessedBusinessAnalysis(processed);
    } else {
      setProcessedBusinessAnalysis(null);
    }
  }, [businessAnalysis]);

  // Function to generate PDF report
  const generatePDF = async () => {
    try {
      toast.info("Generating PDF report...")
      
      const html2pdf = (await import('html2pdf.js')).default;
      
      const pdfContent = document.createElement('div')
      pdfContent.className = 'pdf-content'
      
      // Minimal padding for content
      pdfContent.style.padding = '5mm'
      pdfContent.style.fontFamily = 'Arial, sans-serif'
      pdfContent.style.maxWidth = '210mm' // A4 width
      
      // Simplified title section without forced page break
      const titleSection = document.createElement('div')
      titleSection.style.marginBottom = '15mm'
      titleSection.innerHTML = `
        <h1 style="color: #1a56db; font-size: 24px; margin-bottom: 10px; text-align: center;">Business Analysis Report</h1>
        <div style="color: #4b5563; font-size: 12px; text-align: center;">
          <p style="margin: 5px 0;">Generated: ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0; word-break: break-all;">Source: ${scrapeData.url}</p>
        </div>
      `
      pdfContent.appendChild(titleSection)
      
      // Add business analysis section with minimal spacing
      if (businessAnalysis) {
        const businessSection = document.createElement('div')
        businessSection.style.marginBottom = '10mm'
        
        const businessHeading = document.createElement('h2')
        businessHeading.textContent = 'Business Analysis'
        businessHeading.style.color = '#1e429f'
        businessHeading.style.fontSize = '18px'
        businessHeading.style.marginBottom = '8px'
        businessHeading.style.borderBottom = '1px solid #e5e7eb'
        businessHeading.style.paddingBottom = '4px'
        businessSection.appendChild(businessHeading)
        
        const businessContent = document.createElement('div')
        businessContent.style.lineHeight = '1.4'
        businessContent.style.fontSize = '12px'
        
        const markdownElement = document.querySelector('.markdown-display-business')
        if (markdownElement) {
          businessContent.innerHTML = markdownElement.innerHTML
        } else {
          const processed = processedBusinessAnalysis || businessAnalysis
          businessContent.innerHTML = processed
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1e429f">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/# (.*?)$/gm, '<h3 style="font-size: 14px; margin: 10px 0 6px;">$1</h3>')
            .replace(/## (.*?)$/gm, '<h4 style="font-size: 13px; margin: 8px 0 4px;">$1</h4>')
            .replace(/### (.*?)$/gm, '<h5 style="font-size: 12px; margin: 6px 0 4px;">$1</h5>')
            .replace(/\n- (.*?)$/gm, '<ul style="margin: 4px 0"><li style="margin: 2px 0">$1</li></ul>')
            .replace(/\n/g, '<br />')
        }
        
        businessSection.appendChild(businessContent)
        pdfContent.appendChild(businessSection)
      }
      
      // Add demographics section with minimal spacing
      if (locationDemographics) {
        const demographicsSection = document.createElement('div')
        
        const demographicsHeading = document.createElement('h2')
        demographicsHeading.textContent = 'Location Demographics'
        demographicsHeading.style.color = '#046c4e'
        demographicsHeading.style.fontSize = '18px'
        demographicsHeading.style.marginBottom = '8px'
        demographicsHeading.style.borderBottom = '1px solid #e5e7eb'
        demographicsHeading.style.paddingBottom = '4px'
        demographicsSection.appendChild(demographicsHeading)
        
        const demographicsContent = document.createElement('div')
        demographicsContent.style.lineHeight = '1.4'
        demographicsContent.style.fontSize = '12px'
        
        const markdownElement = document.querySelector('.markdown-display-demographics')
        if (markdownElement) {
          // Use clone of content to avoid modifying the original DOM
          const clonedContent = markdownElement.cloneNode(true);
          
          // Remove gradient styling from any headings in demographics
          const headings = clonedContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
          headings.forEach(heading => {
            heading.style.color = '#000';
            heading.style.background = 'none';
            heading.style.backgroundImage = 'none';
            heading.style.webkitBackgroundClip = 'initial';
            heading.style.webkitTextFillColor = '#000';
          });
          
          // Use clean HTML
          demographicsContent.innerHTML = clonedContent.innerHTML;
        } else {
          // Fallback to simplified plain text conversion if UI element not found
          demographicsContent.innerHTML = locationDemographics
            // Convert ** sections to plain black strong text (no color)
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #000">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convert all markdown headings to simple black headings with proper sizing
            .replace(/# (.*?)$/gm, '<h3 style="color: #000; font-size: 14px; margin: 10px 0 6px; background: none;">$1</h3>')
            .replace(/## (.*?)$/gm, '<h4 style="color: #000; font-size: 13px; margin: 8px 0 4px; background: none;">$1</h4>')
            .replace(/### (.*?)$/gm, '<h5 style="color: #000; font-size: 12px; margin: 6px 0 4px; background: none;">$1</h5>')
            // Handle bullet points
            .replace(/\n- (.*?)$/gm, '<ul style="margin: 4px 0"><li style="margin: 2px 0">$1</li></ul>')
            .replace(/\n/g, '<br />')
        }
        
        demographicsSection.appendChild(demographicsContent)
        pdfContent.appendChild(demographicsSection)
      }
      
      document.body.appendChild(pdfContent)
      
      const options = {
        margin: [5, 5, 5, 5], // Minimal margins (top, right, bottom, left in mm)
        filename: `business-analysis-${id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          putOnlyUsedFonts: true,
          floatPrecision: 16,
          compress: true,
          hotfixes: ["px_scaling"],
          removeHeaders: true, // Remove headers
          removeFooters: true  // Remove footers
        },
        pagebreak: { 
          mode: ['avoid-all', 'css'],
          before: '.page-break-before',
          avoid: [
            'h2', 'h3', 'h4', 'h5',
            '.avoid-break',
            'img',
            'table',
            'tr'
          ]
        }
      }
      
      await html2pdf().from(pdfContent).set(options).save()
      
      document.body.removeChild(pdfContent)
      
      toast.success("PDF report generated successfully")
    } catch (err) {
      console.error("Error generating PDF:", err)
      toast.error("Failed to generate PDF report")
    }
  }

  // Show initial loading state if both analyses are loading
  if (isLoadingBusiness && isLoadingDemographics) {
    return (
      <BackgroundPaths title="Analyzing" subtle={true}>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg">
              {(isAnalyzingBusiness || isAnalyzingDemographics) ? "AI is analyzing the business listing..." : "Loading..."}
            </p>
            {(isAnalyzingBusiness || isAnalyzingDemographics) && (
              <p className="text-sm text-gray-600 mt-2">
                This may take up to a minute. Please wait.
              </p>
            )}
          </div>
        </div>
      </BackgroundPaths>
    )
  }

  // If business analysis failed but we don't have any data, show a full error
  if (businessError && !businessAnalysis) {
    return (
      <BackgroundPaths title="Error" subtle={true}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Analysis Error</h2>
            <p className="text-red-600 dark:text-red-300">{businessError}</p>
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
    <BackgroundPaths title="Analysis" subtle={true}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-400 dark:to-green-400">
            Evaluation Report
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/results/${id}`}>
              <Button variant="outline" size="sm">
                Back to Results
              </Button>
            </Link>
            <Button onClick={generatePDF} size="sm">
              Generate PDF
            </Button>
          </div>
        </div>

        {/* Business Analysis Section */}
        <div className="bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-md border border-blue-100/50 dark:border-blue-700/30 rounded-xl shadow-lg p-4 md:p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">Business Analysis</h3>
          {isLoadingBusiness ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span>Loading business analysis...</span>
            </div>
          ) : businessAnalysis ? (
            <>
              {/* Add debug button to show raw markdown in console (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <button 
                  onClick={() => {
                    console.log("Raw Business Analysis:", businessAnalysis);
                    console.log("Processed Business Analysis:", processedBusinessAnalysis);
                    console.log("Location Demographics:", locationDemographics);
                  }}
                  className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded mb-2"
                >
                  Debug Content
                </button>
              )}
              <div className="markdown-display-business">
                <MarkdownDisplay content={processedBusinessAnalysis || businessAnalysis} />
              </div>
            </>
          ) : (
            <p>No business analysis available.</p>
          )}
        </div>

        {/* Location Demographics Section */}
        <div className="bg-green-50/70 dark:bg-green-900/20 backdrop-blur-md border border-green-100/50 dark:border-green-700/30 rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-700 dark:text-green-300">Location Demographics</h3>
          {isLoadingDemographics ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mr-2"></div>
              <span>Loading demographics data...</span>
            </div>
          ) : locationDemographics ? (
            <div className="markdown-display-demographics">
              <MarkdownDisplay content={locationDemographics} />
            </div>
          ) : (
            <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800/30 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">
                {demographicsError || "Demographics data is not yet available. This data is fetched from external sources and may take longer to process."}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </BackgroundPaths>
  )
}
