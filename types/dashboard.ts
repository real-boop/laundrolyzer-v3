// TypeScript interfaces for the business analysis JSON structure
export interface BusinessAnalysis {
  businessMetrics: BusinessMetrics;
  additionalInformation: AdditionalInformation;
  scoringAnalysis: ScoringAnalysis;
}

export interface BusinessMetrics {
  name: string;
  askingPrice: number;
  revenue: number;
  ebitda: number | null;
  cashFlow: number;
  lease: {
    remainingYears: number | null;
    renewalOptions: string | null;
  };
  equipment: {
    age: {
      value: string;
      isEstimated: boolean;
    };
    description: string;
    washers: number;
    dryers: number;
  };
}

export interface AdditionalInformation {
  paymentSystem: {
    type: string | null;
    description: string | null;
  };
  yearsInOperation: number;
  leaseDetails: {
    monthlyRent: number;
    sqft: number;
  };
  ffAndE: number;
  employees: {
    value: string;
    isEstimated: boolean;
  };
  miscDetails: string[];
}

export interface ScoringAnalysis {
  metrics: Array<{
    name: string;
    result: string;
    score: number | null;
  }>;
  totalScore: {
    achieved: number;
    maximum: number;
    percentage: number;
    classification: string;
  };
}

// Recommendation Tab Interfaces
export interface RecommendationData {
  fairPriceEstimate: FairPriceEstimate;
  businessAnalysis: RecommendationBusinessAnalysis;
}

export interface FairPriceEstimate {
  idealRange: {
    low: number;
    high: number;
    description: string;
  };
  greatDealPrice: {
    price: number;
    description: string;
  };
  currentPriceAssessment: {
    price: number;
    description: string;
  };
}

export interface RecommendationBusinessAnalysis {
  strengths: string[];
  weaknesses: string[];
  questionsForSeller: string[];
  finalRecommendation: {
    verdict: string;
    negotiationFocus: string;
    growthOpportunities: string;
  };
}

// Demographics Data Interfaces
export interface DemographicsData {
  income: {
    median: number;
    comparison: { percentDifference: number };
  };
  age: { median: number };
  population: { density: number };
  housing: {
    ownedHomes: number;
    rentedHomes: number;
    medianHomeValue: number;
    medianRent: number;
  };
  ethnicityDistribution: Array<{
    group: string;
    percentage: number;
  }>;
}

// Competition Data Interfaces
export interface CompetitorData {
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  summary: string;
  services: string[];
}

export interface CompetitionData {
  totalInRadius: number;
  competitors: CompetitorData[];
  notes: string;
} 