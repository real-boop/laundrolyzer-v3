import { useState, useEffect } from 'react';
import { BusinessAnalysis } from '@/types/dashboard';

/**
 * Custom hook to fetch business analysis data
 * @param listingId The ID of the business listing to fetch
 * @returns Object containing analysis data, loading state, and any error
 */
export function useBusinessAnalysis(listingId: string) {
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setIsLoading(true);
        
        // Call the business-score API
        const response = await fetch('/api/business-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: listingId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch business score data');
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Set the analysis from the API response
        setAnalysis(data.businessScoreData);
      } catch (err) {
        console.error('Error fetching business analysis:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalysis();
  }, [listingId]);

  return { analysis, isLoading, error };
} 
