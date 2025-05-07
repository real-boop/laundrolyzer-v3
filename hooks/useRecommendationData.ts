import { useState, useEffect } from 'react';
import { RecommendationData } from '@/types/dashboard';
import { adaptToRecommendationData } from '@/lib/dashboard-adapter';

/**
 * Custom hook to fetch recommendation data
 * @param listingId The ID of the business listing to fetch
 * @returns Object containing recommendation data, loading state, and any error
 */
export function useRecommendationData(listingId: string) {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Use mock data if in development and NEXT_PUBLIC_USE_MOCK_DATA is true
        if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
          console.log('Using mock recommendation data');
          
          // Get the scrape data to pass through the adapter
          const scrapeResponse = await fetch(`/api/get-scrape?id=${listingId}`);
          
          if (!scrapeResponse.ok) {
            throw new Error('Failed to fetch scrape data');
          }
          
          const scrapeData = await scrapeResponse.json();
          
          // Transform the scraped data using the adapter with mock data fallback
          const recommendationData = adaptToRecommendationData(scrapeData, listingId);
          
          setData(recommendationData);
        } else {
          // Call the new recommendation API
          const response = await fetch('/api/recommendation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: listingId }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch recommendation data');
          }
          
          const responseData = await response.json();
          
          if (responseData.error) {
            throw new Error(responseData.error);
          }
          
          // Set the recommendation data from the API response
          setData(responseData.recommendationData);
        }
      } catch (err) {
        console.error('Error fetching recommendation data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [listingId]);

  return { data, isLoading, error };
} 
