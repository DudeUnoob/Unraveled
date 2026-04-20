import { describe, expect, it } from "vitest";
import { ScoreApiError, mapScoreApiResponse } from "./scoreApi";

const validResponse = {
  sustainability_score: {
    value: 82,
    grade: "B",
    model_version: "v1.1-gbr",
    feature_contributions: {
      fiber_composition: {
        feature_value: 0.74,
        model_weight: 0.5,
        breakdown: [
          { fiber: "linen", pct: 55, rank: 0.8, weighted: 44 },
          { fiber: "cotton", pct: 45, rank: 0.65, weighted: 29.25 }
        ]
      },
      brand_reputation: {
        feature_value: 0.66,
        model_weight: 0.3,
        sources: {
          good_on_you: "3.5/5",
          bcorp_certified: false,
          fti_score: "42%",
          remake_score: "39%",
          scrape_signals: "0.44",
          esg_api: {
            provider: "Sustainalytics",
            score: 0.64,
            last_updated: "2026-03-01T10:22:00Z",
            available: true
          }
        }
      },
      micro_trend_longevity: {
        feature_value: 0.75,
        model_weight: 0.2,
        trend_label: "Trending"
      }
    }
  },
  trend_score: {
    label: "Trending",
    lifespan_weeks: 16,
    confidence: 0.79,
    source: "google_trends",
    last_updated: "2026-03-01T10:25:00Z"
  },
  health_score: {
    label: "Safe",
    flags: []
  },
  cpw_estimate: {
    estimated_wears: 52,
    cost_per_wear: 1.15,
    trend_adjusted_wears: 36,
    trend_adjusted_cpw: 1.67,
    fiber_data_available: true,
    price_available: true
  },
  data_sources: {
    google_trends: {
      available: true,
      last_updated: "2026-03-01T10:25:00Z"
    },
    esg_api: {
      available: true,
      provider: "Sustainalytics",
      last_updated: "2026-03-01T10:22:00Z"
    }
  },
  web_app_deep_link: "https://unravel.app/analyze?pid=abc123&source=extension"
};

describe("mapScoreApiResponse", () => {
  it("maps a valid backend payload", () => {
    const mapped = mapScoreApiResponse(validResponse);

    expect(mapped.trendScore.source).toBe("google_trends");
    expect(mapped.sustainabilityScore.featureContributions.brandReputation.sources.esgApi.provider).toBe(
      "Sustainalytics"
    );
    expect(mapped.dataSources.googleTrends.available).toBe(true);
  });

  it("rejects payloads missing trend source metadata", () => {
    const broken = {
      ...validResponse,
      trend_score: {
        ...validResponse.trend_score,
        source: undefined
      }
    };

    expect(() => mapScoreApiResponse(broken)).toThrowError(ScoreApiError);
  });

  it("rejects payloads missing ESG API block", () => {
    const broken = {
      ...validResponse,
      sustainability_score: {
        ...validResponse.sustainability_score,
        feature_contributions: {
          ...validResponse.sustainability_score.feature_contributions,
          brand_reputation: {
            ...validResponse.sustainability_score.feature_contributions.brand_reputation,
            sources: {
              ...validResponse.sustainability_score.feature_contributions.brand_reputation.sources,
              esg_api: undefined
            }
          }
        }
      }
    };

    expect(() => mapScoreApiResponse(broken)).toThrowError(ScoreApiError);
  });

  it("rejects payloads with invalid ISO timestamps", () => {
    const broken = {
      ...validResponse,
      trend_score: {
        ...validResponse.trend_score,
        last_updated: "not-an-iso-date"
      }
    };

    expect(() => mapScoreApiResponse(broken)).toThrowError(ScoreApiError);
  });

  it("accepts payloads when Google Trends source is unavailable (fallback mode)", () => {
    const fallback = {
      ...validResponse,
      data_sources: {
        ...validResponse.data_sources,
        google_trends: {
          ...validResponse.data_sources.google_trends,
          available: false
        }
      }
    };

    const mapped = mapScoreApiResponse(fallback);
    expect(mapped.dataSources.googleTrends.available).toBe(false);
    expect(mapped.trendScore.label).toBe("Trending");
  });
});
