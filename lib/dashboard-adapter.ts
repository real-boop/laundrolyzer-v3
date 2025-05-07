import { BusinessAnalysis, RecommendationData } from '@/types/dashboard';

// Mock data for demographics and competition tabs
import { mockBusinessAnalysis, mockRecommendationData } from './dashboard-mock-data';

/**
 * Adapts scraped data from the API to the BusinessAnalysis format
 * @param scrapeData Raw data from get-scrape API
 * @returns Formatted BusinessAnalysis object
 */
export function adaptToBusinessAnalysis(scrapeData: any, id: string): BusinessAnalysis {
  // For now, we'll use the mock data since we're keeping demographics and competition sections with mock data
  // In the future, this function would transform the real data from the API
  return mockBusinessAnalysis[id] || mockBusinessAnalysis['mock-listing-123'];
}

/**
 * Adapts scraped data from the API to the RecommendationData format
 * @param scrapeData Raw data from get-scrape API
 * @returns Formatted RecommendationData object
 */
export function adaptToRecommendationData(scrapeData: any, id: string): RecommendationData {
  // For now, we'll use the mock data
  // In the future, this function would transform the real data from the API
  return mockRecommendationData[id] || mockRecommendationData['mock-listing-123'];
}

/**
 * Gets the business name from scraped data
 * @param scrapeData Raw data from get-scrape API
 * @returns Business name string
 */
export function getBusinessNameFromScrapeData(scrapeData: any): string {
  // Try to extract business name from scraped data
  // Default to generic name if not found
  try {
    if (scrapeData && scrapeData.json) {
      // Attempt to extract name from various possible fields
      return scrapeData.json.name || 
             scrapeData.json.title || 
             scrapeData.json.businessName || 
             'Laundromat Acquisition Analysis';
    }
  } catch (error) {
    console.error('Error extracting business name:', error);
  }
  
  return 'Laundromat Acquisition Analysis';
}

/**
 * Gets the business location from scraped data
 * @param scrapeData Raw data from get-scrape API
 * @returns Location string
 */
export function getLocationFromScrapeData(scrapeData: any): string {
  // Try to extract location from scraped data
  // Default to generic location if not found
  try {
    if (scrapeData && scrapeData.json) {
      // Attempt to extract location from various possible fields
      return scrapeData.json.location || 
             scrapeData.json.address || 
             scrapeData.json.city ||
             'Arlington, TX';
    }
  } catch (error) {
    console.error('Error extracting location:', error);
  }
  
  return 'Arlington, TX';
} 