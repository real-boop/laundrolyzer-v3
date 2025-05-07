import { BusinessAnalysis, RecommendationData } from '@/types/dashboard';

// Mock business analysis data based on the provided JSON example
export const mockBusinessAnalysis: Record<string, BusinessAnalysis> = {
  "mock-listing-123": {
    "businessMetrics": {
      "name": "Laundromat Acquisition Analysis – Palm Beach Co., FL",
      "askingPrice": 450000,
      "revenue": 260000,
      "ebitda": null,
      "cashFlow": 105000,
      "lease": {
        "remainingYears": null,
        "renewalOptions": null
      },
      "equipment": {
        "age": {
          "value": "Newer (Dexter models), some older",
          "isEstimated": true
        },
        "description": "21 washers, 20 dryers (newer Dexter high-capacity models and well-maintained equipment)",
        "washers": 21,
        "dryers": 20
      }
    },
    "additionalInformation": {
      "paymentSystem": {
        "type": null,
        "description": null
      },
      "yearsInOperation": 35,
      "leaseDetails": {
        "monthlyRent": 6150,
        "sqft": 1200
      },
      "ffAndE": 145000,
      "employees": {
        "value": "2",
        "isEstimated": false
      },
      "miscDetails": [
        "Prime location in a high-traffic shopping center (Publix and McDonald's anchored)",
        "Loyal customer base, 6-day operation (8am–7pm)",
        "Profitable wash & fold and delivery; delivery currently within 2-mile radius",
        "Security system, bill changer, TVs, and amenities included",
        "No seller financing; two weeks transition training offered"
      ]
    },
    "scoringAnalysis": {
      "metrics": [
        {
          "name": "Revenue per Square Foot",
          "result": "$217/sq. ft.",
          "score": 10
        },
        {
          "name": "Profit Margin",
          "result": "40.4%",
          "score": 10
        },
        {
          "name": "Price per Square Foot",
          "result": "$375/sq. ft.",
          "score": 0
        },
        {
          "name": "Revenue Multiple",
          "result": "1.73x",
          "score": 0
        },
        {
          "name": "SDE Multiple",
          "result": "4.3x",
          "score": 0
        },
        {
          "name": "Equipment Age",
          "result": "Newer (Dexter models), some older",
          "score": 5
        },
        {
          "name": "Lease Terms",
          "result": "Unknown",
          "score": null
        }
      ],
      "totalScore": {
        "achieved": 25,
        "maximum": 60,
        "percentage": 41.7,
        "classification": "Average"
      }
    }
  }
};

// Mock data for recommendation tab
export const mockRecommendationData: Record<string, RecommendationData> = {
  "mock-listing-123": {
    fairPriceEstimate: {
      idealRange: {
        low: 335000,
        high: 402000,
        description: "Based on industry benchmarks of 1.0-1.2x revenue ($335,000-$402,000) and 3.0-3.5x SDE ($261,000-$304,500)"
      },
      greatDealPrice: {
        price: 268000,
        description: "At $268,000 (0.8x revenue, 3.1x SDE), this becomes a \"Great\" deal with better profit potential"
      },
      currentPriceAssessment: {
        price: 450000,
        description: "Overpriced at 1.34x revenue and 5.17x SDE, exceeding ideal industry benchmarks significantly"
      }
    },
    businessAnalysis: {
      strengths: [
        "Strong location with no direct competition and high visibility off major highway",
        "Consistent growth with 11% revenue increase driven by city's rapid expansion",
        "Multiple revenue streams including self-service and Wash-N-Fold drop-off service"
      ],
      weaknesses: [
        "Requires owner to work 30 hours weekly (not truly semi-absentee)",
        "Equipment age and maintenance history not disclosed",
        "High asking price relative to industry multiples (5.17x SDE)"
      ],
      questionsForSeller: [
        "What is the age and condition of the washers and dryers? What maintenance records are available?",
        "Can you provide detailed financial statements for the past 3 years, including monthly operating expenses and utility costs?",
        "What are the terms for the triple net lease and what additional costs beyond the $3,404/month are required?",
        "How much revenue comes from the Wash-N-Fold service versus the self-service machines?",
        "Have prices been raised recently and how do they compare to laundromats in nearby cities?"
      ],
      finalRecommendation: {
        verdict: "The laundromat presents a good business opportunity with its prime location and growth potential, but at the current asking price of $450,000, it does not represent a good value (5.17x SDE multiple).",
        negotiationFocus: "Negotiate toward $300,000-$350,000 range based on industry multiples. Emphasize the owner-operator requirement of 30 hours weekly which limits its true semi-absentee status. Request detailed financials and equipment maintenance records before committing.",
        growthOpportunities: "Implementing a commercial delivery business targeting hotels, AirBnBs, restaurants and healthcare facilities would leverage existing equipment during slow periods. The six apartment communities within close proximity offer potential for expanded wash-and-fold marketing efforts."
      }
    }
  }
}; 