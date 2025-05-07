import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// Function to call Perplexity API with explicit timeout
export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Scrape ID is required" }, { status: 400 })
    }

    console.log(`[Demographics API] Processing request for ID: ${id}`)

    // Check if demographics data already exists
    const existingData = await kv.hget(`analysis:${id}`, "locationDemographics")
    if (existingData) {
      console.log(`[Demographics API] Using cached data for ID: ${id}`)
      return NextResponse.json({ locationDemographics: existingData })
    }

    // Get the scraped data from Vercel KV
    const scrapeData = await kv.get(`scrape:${id}`)

    if (!scrapeData) {
      return NextResponse.json({ error: "Scraped data not found" }, { status: 404 })
    }

    // Safely type the scrapeData
    const typedScrapeData = scrapeData as any;
    
    // Use the entire JSON data directly
    const businessData = JSON.stringify(typedScrapeData.data?.json, null, 2) || JSON.stringify(scrapeData, null, 2);
    
    console.log("[Demographics API] Sending data to Perplexity API")

    // Check if Perplexity API key is available
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.error("[Demographics API] Perplexity API key is not set in environment variables");
      return NextResponse.json(
        { error: "Demographics service unavailable due to configuration error" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert in analyzing demographics and local competition for small businesses, specifically laundromats. 
You will receive the entire business listing and first need to extract the location. Data quality may vary, extrapolate if needed. Once you identified the US location data (State, City, ZIP and optionally County), you always perform the following analysis. If location data is incomplete, prioritize state and city information and note any assumptions made.
Don't provide any additional explanations about what you do, just provide the requested outputs in the given format using diligent web search and accurate, most up-to-date data. Adhere exactly to the requested format in your output:

1. Demographics Analysis:
Use US Census Bureau data (prioritize most recent data) and supplement with other reliable, accurate datasources if needed to provide:
   - Population Density: [people per square mile]
   - Median Income: [$figure] ([%] above/below national average of [$national figure])
   - Average Age: [years]
   - Ethnicity Distribution: [percentages for major groups]
   - Other noteworthy demographics relevant to laundromat services: [income distribution, education levels, housing data, proximity to noteworthy businesses or military bases that could require services]

2. Competition Analysis:
Research other laundromats within a 10-mile radius of the location and provide their google maps or yelp reviews, whichever is available. Use this format:
- Identified laundromats in 10-mile radius: Briefly describe identified density of competition
- Provide 3 close competitors in the following format:
Name: [business name]
Address: [full address]
Average Rating: [number] ([count] Reviews)
Summary: [summarize key themes from reviews]

If fewer than 3 competitors exist, provide all available.


Example Output:
**Demographics**

* **Population Density**: Approximately 2,385 people per square mile.
* **Median Income**: $58,983, which is below the national average of $67,149 (as of 2021 data).
* **Average Age**: 35.4 years.

* **Ethnicity Distribution**:
  * Black or African American: 75.7%.
  * Hispanic: 10.2%.
  * White: 10.2%.
  * Two or more races: 3%.

* **Other Noteworthy Demographics**:
  * **Income Distribution**: 18% of households earn less than $25,000, while 14% earn over $150,000.
  * **Education Levels**: 28% have a high school diploma or equivalent, 25% have some college or an associate's degree, and 23% have a bachelor's degree.
  * **Housing**: The median property value is $247,500, with a homeownership rate of 43.7%. There are 2 hospitals, one US Army base and multiple businesses close-by that could require laundering services.


**Competition**
**Identified laundromats in 10-mile radius:** There are more than 10 laundromats in immediate proximity, indicating high competition.
1. **All Clean Laundry of East Point**
  * **Address**: 1776 Washington Rd, Atlanta, GA 30344
  * **Rating**: 4.2
  * **Review Count**: 31
  * **Reviews**: Customers appreciate its cleanliness and accessibility.
2. **Skyline Laundromats (Hapeville)**
  * **Address**: 761 N Central Ave, Hapeville, GA 30354
  * **Rating**: 4.5
  * **Review Count**: 652
  * **Reviews**: Praised for cleanliness, 24-hour service, and customer service.
3. **Skyline Laundromats (Cleveland Ave)**
  * **Address**: 126 Cleveland Ave SW, Atlanta, GA 30315
  * **Rating**: 4.5
  * **Review Count**: 79
  * **Reviews**: Known for cleanliness, friendly staff, and modern facilities.`;

    const userPrompt = `Extract all relevant location data [City, State, County, ZIP] from this business listing.
Then, research the exact demographics for this location using US Census data and the internet and give me accurate data for. After that, find out how many other laundromats are within a 10-mile radius of the location and give me their google maps or yelp reviews. Provide accurate and most up-to-date information.

${businessData}`;

    // Create a fetch request with explicit timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "sonar-pro", 
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          max_tokens: 4096,
          temperature: 0.2,
          top_p: 0.9,
          web_search_options: {
            search_context_size: "high"
          },
          return_related_questions: false,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Demographics API] Perplexity API error: ${response.status} ${errorText}`);
        
        return NextResponse.json(
          { error: `Failed to retrieve location demographics data: ${response.status}` },
          { status: 500 }
        );
      }

      const result = await response.json();
      const demographicsContent = result.choices[0].message.content;

      // Store only the demographics data in Vercel KV
      await kv.hset(`analysis:${id}`, { locationDemographics: demographicsContent });

      console.log(`[Demographics API] Successfully processed data for ID: ${id}`);
      return NextResponse.json({ locationDemographics: demographicsContent });
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        console.error("[Demographics API] Request timed out after 30 seconds");
        return NextResponse.json(
          { error: "Request to demographics service timed out" },
          { status: 504 }
        );
      }
      
      console.error("[Demographics API] Error fetching demographics data:", error);
      return NextResponse.json(
        { error: "An error occurred while analyzing location demographics" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("[Demographics API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to process demographics request" },
      { status: 500 }
    );
  }
} 
