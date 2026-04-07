// Types for the trend analysis API response

export interface CurveDataPoint {
    week: string;
    interest: number;
    source: string;
    projected?: boolean;
}

export interface DecayParams {
    K: number;
    r: number;
    t_peak: number;
    lambda: number;
    r_squared: number;
}

export interface TrendLifespan {
    label: "Timeless" | "Trending" | "Fading" | "Dead";
    color: string;
    score: number;
    peaked_weeks_ago: number;
    weeks_remaining: number;
    confidence: number;
    velocity: number;
}

export interface TrendCurve {
    data_points: CurveDataPoint[];
    peak_week: string;
    death_week: string;
    model_type: string;
    r_squared: number;
}

export interface BrandInfo {
    name: string;
    found: boolean;
    normalized_score: number;
    good_on_you?: string | null;
    bcorp_certified?: boolean | null;
    fti_score?: string | null;
}

export interface TrendAnalysisResponse {
    analysis_id: string;
    query_normalized: string;
    trend_lifespan: TrendLifespan;
    trend_curve: TrendCurve;
    decay_params: DecayParams;
    data_sources: {
        google_trends: {
            available: boolean;
            serp_key_configured?: boolean;
            last_updated: string;
            from_cache: boolean;
            note?: string;
        };
        tiktok?: {
            available: boolean;
            last_updated: string;
            hashtag_views?: number;
            post_count?: number;
        };
        pinterest?: {
            available: boolean;
            last_updated: string;
            total_results?: number;
        };
    };
    shareable_url: string | null;
    brand_info?: BrandInfo;
}

export interface ImageAnalysisResponse {
  style_description: string;
  category: string;
  brand: string | null;
  keywords: string[];
  suggested_query: string;
}

export type AnalysisState = "idle" | "loading" | "success" | "error";

export interface AnalysisStore {
    state: AnalysisState;
    data: TrendAnalysisResponse | null;
    error: string | null;
    query: string;
}

// Extension deep-link data (parsed from URL query params)
export interface ExtensionData {
    productName: string;
    productUrl: string;
    brand: string;
    price: number | null;
    currency: string;
    sustainabilityScore: number;
    sustainabilityGrade: string;
    trendLabel: string;
    trendLifespanWeeks: number;
    cpw: number;
    cpwAdjusted: number;
    healthLabel: string;
    // W-1.10: detailed breakdown text
    fiberComposition: string;       // e.g. "55% Linen · 30% Cotton · 15% Polyester"
    brandRatingSources: string;     // e.g. "Good On You: 3/5 · FTI: 42% · Not B-Corp"
    fiberDurabilityWears: number;   // e.g. 45
}

// CPW analysis data (computed client-side or from extension)
export interface CpwData {
    price: number;
    currency: string;
    standardCpw: number;
    standardWears: number;
    trendAdjustedCpw: number;
    trendAdjustedWears: number;
    trendLabel: string;
}
