/**
 * Dashboard utility functions for working with scraped data
 */

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
      // If we already pre-formatted the location string, use it
      if (scrapeData.json.locationString && typeof scrapeData.json.locationString === 'string') {
        return scrapeData.json.locationString;
      }
      
      // Handle location object structure
      if (scrapeData.json.location && typeof scrapeData.json.location === 'object') {
        const loc = scrapeData.json.location;
        
        // Check if the location object itself is stringifiable
        if (loc.toString && loc.toString() !== '[object Object]') {
          return loc.toString();
        }
        
        // Otherwise, build a string from available parts
        const parts = [
          loc.city,
          loc.state,
          loc.county ? `(${loc.county})` : null,
          loc.zip
        ].filter(Boolean); // Remove null/empty values
        
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
      
      // Fallback to other possible location fields
      return scrapeData.json.address || 
             scrapeData.json.city ||
             (typeof scrapeData.json.location === 'string' ? scrapeData.json.location : 'Arlington, TX');
    }
  } catch (error) {
    console.error('Error extracting location:', error);
  }
  
  return 'Arlington, TX';
} 
