import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// Mock demographics data
const MOCK_DEMOGRAPHICS = `**Demographics**

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

    // Store mock data in Vercel KV
    await kv.hset(`analysis:${id}`, { locationDemographics: MOCK_DEMOGRAPHICS });

    console.log(`[Demographics API] Successfully processed mock data for ID: ${id}`);
    return NextResponse.json({ locationDemographics: MOCK_DEMOGRAPHICS });

  } catch (error: unknown) {
    console.error("[Demographics API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to process demographics request" },
      { status: 500 }
    );
  }
} 
