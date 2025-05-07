import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Star,
  DollarSign,
  Users,
  Building,
  BarChart3,
  Users2,
  CheckCircle,
  Map,
} from "lucide-react";
import { LoadingIndicator } from "./ui/loading-indicator";
import { ErrorDisplay } from "./ui/error-display";
import { BusinessScoreTab } from "./business-score/business-score-tab";
import { RecommendationTab } from "./recommendation/recommendation-tab";
import { getBusinessNameFromScrapeData, getLocationFromScrapeData } from "@/lib/dashboard-adapter";

// Define the DemographicsData and CompetitorData types
import { DemographicsData, CompetitionData, CompetitorData } from "@/types/dashboard";

interface DashboardProps {
  listingId: string;
  scrapeData: any; // The raw data from the API
}

const Dashboard = ({ listingId, scrapeData }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("demographics");
  const [windowWidth, setWindowWidth] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Extract business name and location from scrape data
  const businessName = getBusinessNameFromScrapeData(scrapeData);
  const businessLocation = getLocationFromScrapeData(scrapeData);

  // Handle window resize and header height calculation
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    }

    // Set initial width and calculate header height
    setWindowWidth(window.innerWidth);
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine if mobile view based on width
  const isMobile = windowWidth < 768;

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Demographics component
  const Demographics = () => {
    const COLORS = ["#34C759", "#5AC8FA", "#007AFF", "#AF52DE", "#FF9500", "#FF2D55"];

    const demographics: DemographicsData = {
      income: {
        median: 65600,
        comparison: { percentDifference: -7.3 },
      },
      age: { median: 34.8 },
      population: { density: 3876 },
      housing: {
        ownedHomes: 0.55,
        rentedHomes: 0.45,
        medianHomeValue: 256000,
        medianRent: 1185,
      },
      ethnicityDistribution: [
        { group: "Hispanic", percentage: 0.29 },
        { group: "White", percentage: 0.39 },
        { group: "Black", percentage: 0.22 },
        { group: "Asian", percentage: 0.07 },
        { group: "Other", percentage: 0.03 },
      ],
    };

    return (
      <div className="w-full space-y-8">
        {/* Core Demographics Metrics - 4 key metrics at the top */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Core Demographics Metrics</h3>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <MetricCard
                icon={<DollarSign className="w-5 h-5" />}
                title="Median Income"
                value={formatCurrency(demographics.income.median)}
                comparison={`${demographics.income.comparison.percentDifference}% vs national`}
                trend="negative"
              />

              <MetricCard
                icon={<Users2 className="w-5 h-5" />}
                title="Median Age"
                value={demographics.age.median.toString()}
                comparison="-8.9% vs national"
                trend="negative"
              />

              <MetricCard
                icon={<Building className="w-5 h-5" />}
                title="Population Density"
                value={demographics.population.density.toLocaleString()}
                comparison="+4023% vs national"
                trend="positive"
              />

              <MetricCard
                icon={<Building className="w-5 h-5" />}
                title="Home Ownership"
                value={`${(demographics.housing.ownedHomes * 100).toFixed(0)}%`}
                comparison="-15.4% vs national"
                trend="negative"
              />
            </div>
          </div>
        </Card>

        {/* Ethnicity Distribution - Modern Horizontal bar chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Ethnicity Distribution</h3>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="w-full h-12 mb-6">
              <div className="w-full h-full flex rounded-xl overflow-hidden">
                {demographics.ethnicityDistribution.map((entry, i) => (
                  <div
                    key={i}
                    className="h-full transition-all duration-300 hover:opacity-90"
                    style={{
                      width: `${entry.percentage * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {demographics.ethnicityDistribution.map((entry, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className="w-3 h-3 mr-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {entry.group}: {(entry.percentage * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Other Demographics - Single text box */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Other Demographics</h3>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-3 border-b border-gray-100 gap-2">
                <span className="font-medium text-gray-900">Median Home Value</span>
                <span className="text-gray-700">
                  {formatCurrency(demographics.housing.medianHomeValue)}{" "}
                  <span className="text-red-500">(-9% vs national)</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-3 border-b border-gray-100 gap-2">
                <span className="font-medium text-gray-900">Business Density</span>
                <span className="text-gray-700">
                  42.5 businesses per square mile <span className="text-gray-500">(vs. county average: 38.2)</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-3 border-b border-gray-100 gap-2">
                <span className="font-medium text-gray-900">Education</span>
                <span className="text-gray-700">
                  88% high school diploma, 41% bachelor's degree, 13% graduate degree
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-3 border-b border-gray-100 gap-2">
                <span className="font-medium text-gray-900">Income Distribution</span>
                <span className="text-gray-700">
                  18% under $25K, 25% $25K-$50K, 22% $50K-$75K, 15% $75K-$100K, 20% over $100K
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-3 border-b border-gray-100 gap-2">
                <span className="font-medium text-gray-900">Household Size</span>
                <span className="text-gray-700">Average 2.71 people per household (147,000 total households)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[30%_70%] py-3 gap-2">
                <span className="font-medium text-gray-900">Population Growth</span>
                <span className="text-gray-700">
                  <span className="text-green-500">+8%</span> over the past 5 years
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Badge component
  const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>;
  };

  // Competition data
  const competitionData: CompetitionData = {
    totalInRadius: 8,
    competitors: [
      {
        name: "Wash World Laundromat",
        address: "2405 E Pioneer Pkwy, Arlington, TX",
        distance: 1.2,
        rating: 4.3,
        reviewCount: 87,
        summary:
          "Higher-end facility with wash-and-fold service, free WiFi, and newer machines. Slightly higher prices but clean environment.",
        services: ["Self-service", "Wash-and-fold", "Free WiFi", "Vending machines"],
      },
      {
        name: "Speedy Spin Laundry",
        address: "1845 S Cooper St, Arlington, TX",
        distance: 1.5,
        rating: 3.8,
        reviewCount: 56,
        summary: "Average facility with some newer and some older machines. Competitive prices and 24-hour access.",
        services: ["Self-service", "24-hour access", "Vending machines"],
      },
      {
        name: "Suds & Duds",
        address: "816 N Collins St, Arlington, TX",
        distance: 2.1,
        rating: 2.9,
        reviewCount: 32,
        summary: "Older facility with dated equipment. Lower prices but frequently has maintenance issues.",
        services: ["Self-service", "Attendant during daytime"],
      },
    ],
    notes:
      "The subject laundromat has newer equipment (4-6 years old) compared to competitors (average 8 years old). It offers a card payment system which is more modern than some competitors still using coins. The location has less nearby residential density than Wash World but better parking. Main competitive disadvantage is lack of additional services like wash-and-fold which the highest-rated competitor offers.",
  };

  // Competition component
  const Competition = () => {
    return (
      <div className="space-y-8">
        {/* Map Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Local Competition</h3>
              <Badge className="bg-blue-100 text-blue-800">{competitionData.totalInRadius} nearby</Badge>
            </div>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="aspect-w-16 aspect-h-9 w-full h-64 bg-gray-50 rounded-xl mb-4 overflow-hidden">
              {/* Placeholder for map */}
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                  <Map className="w-12 h-12 mx-auto mb-3 text-blue-500 opacity-80" />
                  <p className="font-medium text-gray-900">Google Maps would appear here</p>
                  <p className="text-sm text-gray-500 mt-1">(Requires API key)</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">Map showing laundromats near {businessLocation}</p>
          </div>
        </Card>

        {/* 3 Close Competitors Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">3 Close Competitors</h3>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="space-y-6">
              {competitionData.competitors.map((competitor, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h3 className="font-semibold text-lg text-gray-900">{competitor.name}</h3>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(competitor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-700">({competitor.reviewCount})</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700 mt-2 mb-3">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm mr-2">{competitor.address}</span>
                    <Badge className="bg-gray-200 text-gray-700">{competitor.distance} miles</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{competitor.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {competitor.services.map((service, i) => (
                      <Badge key={i} className="bg-blue-50 text-blue-700">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Notes on Competition Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Notes on Competition</h3>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="p-5 bg-gray-50 rounded-xl">
              <p className="text-gray-700 leading-relaxed">{competitionData.notes}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Card component for consistent styling
  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return (
      <div
        className={`w-full bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden transition-all hover:shadow-lg hover:border-gray-300 ${className}`}
      >
        {children}
      </div>
    );
  };

  // Card header component
  const CardHeader = ({ children }: { children: React.ReactNode }) => {
    return <div className="px-6 py-5 border-b border-gray-100">{children}</div>;
  };

  // Metric card component
  const MetricCard = ({
    icon,
    title,
    value,
    comparison,
    trend = "neutral",
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    comparison: string;
    trend?: "positive" | "negative" | "neutral";
  }) => {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center text-gray-500 mb-2">
            <div className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
              {icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-xs text-gray-500">{comparison}</div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Unified Header and Navigation Container */}
      <div ref={headerRef} className="sticky top-0 left-0 right-0 z-40 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{businessName}</h1>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{businessLocation}</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Icon-only on mobile */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <nav className="grid grid-cols-4 w-full">
              <button
                onClick={() => setActiveTab("score")}
                className={`py-4 px-2 sm:px-6 text-sm font-medium transition-colors relative ${
                  activeTab === "score" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Business Score"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start">
                  <BarChart3
                    className={`w-5 h-5 sm:mr-2 ${activeTab === "score" ? "text-blue-600" : "text-gray-400"}`}
                  />
                  <span className="hidden sm:inline">Business Score</span>
                  <span className="text-[10px] mt-1 sm:hidden">Score</span>
                </div>
                {activeTab === "score" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
              </button>
              <button
                onClick={() => setActiveTab("recommendation")}
                className={`py-4 px-2 sm:px-6 text-sm font-medium transition-colors relative ${
                  activeTab === "recommendation" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Recommendation"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start">
                  <CheckCircle
                    className={`w-5 h-5 sm:mr-2 ${activeTab === "recommendation" ? "text-blue-600" : "text-gray-400"}`}
                  />
                  <span className="hidden sm:inline">Recommendation</span>
                  <span className="text-[10px] mt-1 sm:hidden">Rec</span>
                </div>
                {activeTab === "recommendation" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("demographics")}
                className={`py-4 px-2 sm:px-6 text-sm font-medium transition-colors relative ${
                  activeTab === "demographics" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Demographics"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start">
                  <Users
                    className={`w-5 h-5 sm:mr-2 ${activeTab === "demographics" ? "text-blue-600" : "text-gray-400"}`}
                  />
                  <span className="hidden sm:inline">Demographics</span>
                  <span className="text-[10px] mt-1 sm:hidden">Demo</span>
                </div>
                {activeTab === "demographics" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("competition")}
                className={`py-4 px-2 sm:px-6 text-sm font-medium transition-colors relative ${
                  activeTab === "competition" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Competition"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start">
                  <Building
                    className={`w-5 h-5 sm:mr-2 ${activeTab === "competition" ? "text-blue-600" : "text-gray-400"}`}
                  />
                  <span className="hidden sm:inline">Competition</span>
                  <span className="text-[10px] mt-1 sm:hidden">Comp</span>
                </div>
                {activeTab === "competition" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content - Consistent spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {activeTab === "score" && <BusinessScoreTab listingId={listingId} />}

        {activeTab === "recommendation" && <RecommendationTab listingId={listingId} />}

        {activeTab === "demographics" && <Demographics />}

        {activeTab === "competition" && <Competition />}
      </div>
    </div>
  );
};

export default Dashboard; 