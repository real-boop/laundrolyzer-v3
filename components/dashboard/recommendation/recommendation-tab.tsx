import React from "react";
import { useRecommendationData } from "@/hooks/useRecommendationData";
import { LoadingIndicator } from "../ui/loading-indicator";
import { ErrorDisplay } from "../ui/error-display";
import { EmptyState } from "../ui/empty-state";
import { ArrowDown, ArrowUp, CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface RecommendationTabProps {
  listingId: string;
}

export function RecommendationTab({ listingId }: RecommendationTabProps) {
  const { data, isLoading, error } = useRecommendationData(listingId);

  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorDisplay message={error.message} />;
  if (!data) return <EmptyState message="No recommendation data available" />;

  const { fairPriceEstimate, businessAnalysis } = data;
  const { strengths, weaknesses, questionsForSeller, finalRecommendation } = businessAnalysis;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Fair Price Estimate */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Fair Price Estimate</h3>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-xl p-5 text-center">
              <div className="font-medium text-green-800 mb-1">Great Deal Price</div>
              <div className="text-2xl font-bold text-green-700 mb-1">
                {formatCurrency(fairPriceEstimate.greatDealPrice.price)}
              </div>
              <p className="text-sm text-green-700">{fairPriceEstimate.greatDealPrice.description}</p>
              <div className="flex justify-center mt-2">
                <ArrowDown className="h-5 w-5 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-5 text-center">
              <div className="font-medium text-blue-800 mb-1">Ideal Range</div>
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {formatCurrency(fairPriceEstimate.idealRange.low)} - {formatCurrency(fairPriceEstimate.idealRange.high)}
              </div>
              <p className="text-sm text-blue-700">{fairPriceEstimate.idealRange.description}</p>
            </div>

            <div className="bg-red-50 rounded-xl p-5 text-center">
              <div className="font-medium text-red-800 mb-1">Current Price</div>
              <div className="text-2xl font-bold text-red-700 mb-1">
                {formatCurrency(fairPriceEstimate.currentPriceAssessment.price)}
              </div>
              <p className="text-sm text-red-700">{fairPriceEstimate.currentPriceAssessment.description}</p>
              <div className="flex justify-center mt-2">
                <ArrowUp className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Recommendation */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Final Recommendation</h3>
        </div>
        <div className="px-6 py-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Verdict</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{finalRecommendation.verdict}</p>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Negotiation Focus</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{finalRecommendation.negotiationFocus}</p>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Growth Opportunities</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{finalRecommendation.growthOpportunities}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Business Strengths */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-green-700">Business Strengths</h3>
          </div>
          <div className="px-6 py-6">
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Business Weaknesses */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-red-700">Business Weaknesses</h3>
          </div>
          <div className="px-6 py-6">
            <ul className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Questions for Seller */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-blue-700">Questions for Seller</h3>
        </div>
        <div className="px-6 py-6">
          <ul className="space-y-3">
            {questionsForSeller.map((question, index) => (
              <li key={index} className="flex">
                <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" />
                <span className="text-gray-700">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 