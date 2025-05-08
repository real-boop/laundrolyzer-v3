import { useState, useEffect } from 'react';
import { RecommendationData } from '@/types/dashboard';

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
        
        // Call the recommendation API
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
