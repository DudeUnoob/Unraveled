export type TrendLabel = "Timeless" | "Trending" | "Fading" | "Dead";
export type HealthLabel = "Safe" | "Caution" | "Avoid";
export type SustainabilityGrade = "A" | "B" | "C" | "D" | "F";
export type TrendDataSource = "google_trends";
export type ScoreStateStatus = "ready" | "stale" | "error";
export type ScoreErrorCode =
  | "network"
  | "timeout"
  | "http_status"
  | "invalid_contract"
  | "source_unavailable";

export interface ProductContext {
  productUrl: string;
  productName: string;
  brand: string;
  category: string;
  currency: string;
  retailerDomain: string;
  descriptionText: string;
  fiberText: string;
  fiberContent: Record<string, number>;
  price?: number;
  imageUrl?: string;
}

export interface RetailerSelectorConfig {
  retailer: string;
  productUrlPatterns: string[];
  nameSelectors: string[];
  priceSelectors: string[];
  materialSelectors: string[];
  descriptionSelectors: string[];
  imageSelectors: string[];
}

export type ScoringMode = "full" | "fiber_only";

export interface SustainabilityScore {
  value: number;
  grade: SustainabilityGrade;
  modelVersion: string;
  scoringMode: ScoringMode;
  featureContributions: {
    fiberComposition: {
      featureValue: number;
      modelWeight: number;
      breakdown: Array<{
        fiber: string;
        pct: number;
        rank: number;
        weighted: number;
      }>;
    };
    brandReputation: {
      featureValue: number;
      modelWeight: number;
      brandDataAvailable: boolean;
      sources: {
        goodOnYou: string;
        bcorpCertified: boolean;
        ftiScore: string;
        remakeScore: string;
        scrapeSignals: string;
        esgApi: {
          provider: string;
          score: number;
          lastUpdated: string;
          available: boolean;
        };
      };
    };
    microTrendLongevity: {
      featureValue: number;
      modelWeight: number;
      trendLabel: TrendLabel;
    };
  };
}

export interface ScoreResult {
  sustainabilityScore: SustainabilityScore;
  trendScore: {
    label: TrendLabel;
    lifespanWeeks: number;
    confidence: number;
    source: TrendDataSource;
    lastUpdated: string;
  };
  healthScore: {
    label: HealthLabel;
    flags: string[];
  };
  cpwEstimate: {
    estimatedWears: number;
    costPerWear: number;
    trendAdjustedWears: number;
    trendAdjustedCpw: number;
    fiberDataAvailable: boolean;
  };
  dataSources: {
    googleTrends: {
      available: boolean;
      lastUpdated: string;
    };
    esgApi: {
      available: boolean;
      provider: string;
      lastUpdated: string;
    };
  };
  webAppDeepLink: string;
}

export interface ScoredProductPayload {
  product: ProductContext;
  score: ScoreResult;
  scoredAt: string;
  manualMode?: boolean;
}

export interface TabScoreState {
  status: ScoreStateStatus;
  payload?: ScoredProductPayload;
  errorCode?: ScoreErrorCode;
  errorMessage?: string;
  cachedAt?: string;
}

export interface ManualSeedContext {
  productUrl: string;
  productName: string;
  brand?: string;
  category?: string;
  currency?: string;
  retailerDomain?: string;
  price?: number;
}

export type RuntimeMessage =
  | { type: "UNRAVEL_PRODUCT_DETECTED"; payload: ProductContext }
  | { type: "UNRAVEL_GET_SCORE_FOR_TAB"; tabId: number }
  | { type: "UNRAVEL_REFRESH_SCORE_FOR_TAB"; tabId: number }
  | { type: "UNRAVEL_EXTRACT_PRODUCT_CONTEXT" }
  | {
      type: "UNRAVEL_SCORE_MANUAL_FIBERS";
      tabId: number;
      fiberText: string;
      seed?: ManualSeedContext;
    };
