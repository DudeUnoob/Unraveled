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

export interface TrendAnalysisResponse {
    analysis_id: string;
    query_normalized: string;
    trend_lifespan: TrendLifespan;
    trend_curve: TrendCurve;
    decay_params: DecayParams;
    data_sources: {
        google_trends: {
            available: boolean;
            last_updated: string;
            from_cache: boolean;
        };
    };
    shareable_url: string | null;
}

export type AnalysisState = "idle" | "loading" | "success" | "error";

export interface AnalysisStore {
    state: AnalysisState;
    data: TrendAnalysisResponse | null;
    error: string | null;
    query: string;
}
