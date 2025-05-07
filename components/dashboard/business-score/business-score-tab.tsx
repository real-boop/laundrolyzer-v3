import React from "react";
import { useBusinessAnalysis } from "@/hooks/useBusinessAnalysis";
import { LoadingIndicator } from "../ui/loading-indicator";
import { ErrorDisplay } from "../ui/error-display";
import { EmptyState } from "../ui/empty-state";

interface BusinessScoreTabProps {
  listingId: string;
}

export function BusinessScoreTab({ listingId }: BusinessScoreTabProps) {
  const { analysis, isLoading, error } = useBusinessAnalysis(listingId);

  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorDisplay message={error.message} />;
  if (!analysis) return <EmptyState message="No analysis data available" />;

  const { businessMetrics, scoringAnalysis } = analysis;

  return (
    <div className="space-y-8">
      {/* Key Business Metrics */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Key Business Metrics</h3>
        </div>
        <div className="px-6 pb-6">
          <div className="grid gap-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-2 border-b border-gray-100">
              <span className="font-medium text-gray-900">Asking Price</span>
              <span className="text-gray-700">${businessMetrics.askingPrice?.toLocaleString() || "N/A"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-2 border-b border-gray-100">
              <span className="font-medium text-gray-900">Annual Revenue</span>
              <span className="text-gray-700">${businessMetrics.revenue?.toLocaleString() || "N/A"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-2 border-b border-gray-100">
              <span className="font-medium text-gray-900">Cash Flow (SDE)</span>
              <span className="text-gray-700">${businessMetrics.cashFlow?.toLocaleString() || "N/A"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-2 border-b border-gray-100">
              <span className="font-medium text-gray-900">Equipment</span>
              <span className="text-gray-700">{businessMetrics.equipment?.description || "N/A"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-2">
              <span className="font-medium text-gray-900">Years in Operation</span>
              <span className="text-gray-700">{analysis.additionalInformation?.yearsInOperation || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Business Scoring */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Business Score</h3>
        </div>
        <div className="px-6 py-6">
          {/* Score Summary */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-32 h-32 flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{scoringAnalysis.totalScore.percentage}%</div>
                  <div className="text-sm font-medium text-gray-600">{scoringAnalysis.totalScore.classification}</div>
                </div>
              </div>
              {/* Progress Ring - Would be more complex in a real implementation */}
              <div 
                className="absolute inset-0 rounded-full border-8 border-blue-500" 
                style={{ 
                  clipPath: `polygon(50% 0, 100% 0, 100% 100%, 50% 100%, 50% 50%)`,
                  opacity: 0.3
                }}
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-gray-700 mt-2">
                This business scores <strong>{scoringAnalysis.totalScore.achieved}</strong> out of{" "}
                <strong>{scoringAnalysis.totalScore.maximum}</strong> possible points.
              </p>
            </div>
          </div>
          
          {/* Individual Metrics */}
          <div className="space-y-4">
            {scoringAnalysis.metrics.map((metric, index) => (
              <div key={index} className="py-3 border-b border-gray-100 last:border-0">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-900">{metric.name}</span>
                  <span className="font-semibold">
                    {metric.score !== null ? `${metric.score}/10` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className={`h-2.5 rounded-full ${
                        metric.score === null ? 'bg-gray-400' : 
                        metric.score >= 7 ? 'bg-green-500' : 
                        metric.score >= 4 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${metric.score === null ? 0 : (metric.score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-32 flex-shrink-0">{metric.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 