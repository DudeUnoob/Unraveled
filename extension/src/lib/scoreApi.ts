import type { HealthLabel, ScoreErrorCode, ScoreResult, SustainabilityGrade, TrendLabel } from "../types";

const SCORE_RANGE = { min: 0, max: 100 };
const UNIT_RANGE = { min: 0, max: 1 };

const trendLabels = new Set<TrendLabel>(["Timeless", "Trending", "Fading", "Dead"]);
const healthLabels = new Set<HealthLabel>(["Safe", "Caution", "Avoid"]);
const sustainabilityGrades = new Set<SustainabilityGrade>(["A", "B", "C", "D", "F"]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const assertObject = (value: unknown, path: string): Record<string, unknown> => {
  if (!isObject(value)) {
    throw new ScoreApiError("invalid_contract", `${path} must be an object`);
  }
  return value;
};

const assertArray = (value: unknown, path: string): unknown[] => {
  if (!Array.isArray(value)) {
    throw new ScoreApiError("invalid_contract", `${path} must be an array`);
  }
  return value;
};

const assertString = (value: unknown, path: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ScoreApiError("invalid_contract", `${path} must be a non-empty string`);
  }
  return value;
};

const assertBoolean = (value: unknown, path: string): boolean => {
  if (typeof value !== "boolean") {
    throw new ScoreApiError("invalid_contract", `${path} must be a boolean`);
  }
  return value;
};

const assertNumber = (
  value: unknown,
  path: string,
  range?: { min: number; max: number }
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ScoreApiError("invalid_contract", `${path} must be a finite number`);
  }

  if (range && (value < range.min || value > range.max)) {
    throw new ScoreApiError(
      "invalid_contract",
      `${path} must be between ${range.min} and ${range.max}`
    );
  }

  return value;
};

const assertIsoDate = (value: unknown, path: string): string => {
  const parsed = assertString(value, path);
  if (Number.isNaN(Date.parse(parsed))) {
    throw new ScoreApiError("invalid_contract", `${path} must be a valid ISO timestamp`);
  }
  return parsed;
};

const assertEnum = <T extends string>(value: unknown, path: string, allowed: Set<T>): T => {
  const parsed = assertString(value, path);
  if (!allowed.has(parsed as T)) {
    throw new ScoreApiError("invalid_contract", `${path} has unsupported value "${parsed}"`);
  }
  return parsed as T;
};

const optionalString = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

export class ScoreApiError extends Error {
  readonly code: ScoreErrorCode;
  readonly status?: number;

  constructor(code: ScoreErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ScoreApiError";
    this.code = code;
    this.status = status;
  }
}

export const mapScoreApiResponse = (raw: unknown): ScoreResult => {
  const root = assertObject(raw, "response");
  const sustainabilityScore = assertObject(root.sustainability_score, "sustainability_score");
  const featureContributions = assertObject(
    sustainabilityScore.feature_contributions,
    "sustainability_score.feature_contributions"
  );

  const fiberComposition = assertObject(
    featureContributions.fiber_composition,
    "sustainability_score.feature_contributions.fiber_composition"
  );
  const fiberBreakdown = assertArray(
    fiberComposition.breakdown,
    "sustainability_score.feature_contributions.fiber_composition.breakdown"
  ).map((row, index) => {
    const item = assertObject(
      row,
      `sustainability_score.feature_contributions.fiber_composition.breakdown[${index}]`
    );
    return {
      fiber: assertString(item.fiber, `fiber_breakdown[${index}].fiber`),
      pct: assertNumber(item.pct, `fiber_breakdown[${index}].pct`, SCORE_RANGE),
      rank: assertNumber(item.rank, `fiber_breakdown[${index}].rank`, UNIT_RANGE),
      weighted: assertNumber(item.weighted, `fiber_breakdown[${index}].weighted`)
    };
  });

  const brandReputation = assertObject(
    featureContributions.brand_reputation,
    "sustainability_score.feature_contributions.brand_reputation"
  );
  const brandSources = assertObject(
    brandReputation.sources,
    "sustainability_score.feature_contributions.brand_reputation.sources"
  );
  const esgApi = assertObject(
    brandSources.esg_api,
    "sustainability_score.feature_contributions.brand_reputation.sources.esg_api"
  );

  const trendLongevity = assertObject(
    featureContributions.micro_trend_longevity,
    "sustainability_score.feature_contributions.micro_trend_longevity"
  );
  const trendScore = assertObject(root.trend_score, "trend_score");
  const healthScore = assertObject(root.health_score, "health_score");
  const cpwEstimate = assertObject(root.cpw_estimate, "cpw_estimate");
  const dataSources = assertObject(root.data_sources, "data_sources");
  const googleTrendsSource = assertObject(dataSources.google_trends, "data_sources.google_trends");
  const esgDataSource = assertObject(dataSources.esg_api, "data_sources.esg_api");

  const trendSource = assertEnum(
    trendScore.source,
    "trend_score.source",
    new Set<"google_trends">(["google_trends"])
  );

  const googleTrendsAvailable = assertBoolean(
    googleTrendsSource.available,
    "data_sources.google_trends.available"
  );
  const esgAvailable = assertBoolean(esgDataSource.available, "data_sources.esg_api.available");
  const esgApiAvailableInSources = assertBoolean(
    esgApi.available,
    "sustainability_score.feature_contributions.brand_reputation.sources.esg_api.available"
  );

  // Accept the response regardless of source availability — the backend now
  // honestly reports when Google Trends fell back to keyword classification.
  // Confidence scores already indicate data quality.

  const scoringModes = new Set<"full" | "fiber_only">(["full", "fiber_only"]);
  const scoringMode = typeof sustainabilityScore.scoring_mode === "string" && scoringModes.has(sustainabilityScore.scoring_mode as "full" | "fiber_only")
    ? (sustainabilityScore.scoring_mode as "full" | "fiber_only")
    : "full";

  return {
    sustainabilityScore: {
      value: Math.round(assertNumber(sustainabilityScore.value, "sustainability_score.value", SCORE_RANGE)),
      grade: assertEnum(sustainabilityScore.grade, "sustainability_score.grade", sustainabilityGrades),
      modelVersion: assertString(sustainabilityScore.model_version, "sustainability_score.model_version"),
      scoringMode,
      featureContributions: {
        fiberComposition: {
          featureValue: assertNumber(
            fiberComposition.feature_value,
            "sustainability_score.feature_contributions.fiber_composition.feature_value",
            UNIT_RANGE
          ),
          modelWeight: assertNumber(
            fiberComposition.model_weight,
            "sustainability_score.feature_contributions.fiber_composition.model_weight",
            UNIT_RANGE
          ),
          breakdown: fiberBreakdown
        },
        brandReputation: {
          featureValue: assertNumber(
            brandReputation.feature_value,
            "sustainability_score.feature_contributions.brand_reputation.feature_value",
            UNIT_RANGE
          ),
          modelWeight: assertNumber(
            brandReputation.model_weight,
            "sustainability_score.feature_contributions.brand_reputation.model_weight",
            UNIT_RANGE
          ),
          brandDataAvailable: typeof brandReputation.brand_data_available === "boolean"
            ? brandReputation.brand_data_available
            : true,
          sources: {
            goodOnYou: assertString(brandSources.good_on_you, "brand_reputation.sources.good_on_you"),
            bcorpCertified: assertBoolean(
              brandSources.bcorp_certified,
              "brand_reputation.sources.bcorp_certified"
            ),
            ftiScore: assertString(brandSources.fti_score, "brand_reputation.sources.fti_score"),
            remakeScore: optionalString(brandSources.remake_score, "n/a"),
            scrapeSignals: optionalString(brandSources.scrape_signals, "n/a"),
            esgApi: {
              provider: assertString(esgApi.provider, "brand_reputation.sources.esg_api.provider"),
              score: assertNumber(esgApi.score, "brand_reputation.sources.esg_api.score", UNIT_RANGE),
              lastUpdated: assertIsoDate(
                esgApi.last_updated,
                "brand_reputation.sources.esg_api.last_updated"
              ),
              available: esgApiAvailableInSources
            }
          }
        },
        microTrendLongevity: {
          featureValue: assertNumber(
            trendLongevity.feature_value,
            "sustainability_score.feature_contributions.micro_trend_longevity.feature_value",
            UNIT_RANGE
          ),
          modelWeight: assertNumber(
            trendLongevity.model_weight,
            "sustainability_score.feature_contributions.micro_trend_longevity.model_weight",
            UNIT_RANGE
          ),
          trendLabel: assertEnum(
            trendLongevity.trend_label,
            "sustainability_score.feature_contributions.micro_trend_longevity.trend_label",
            trendLabels
          )
        }
      }
    },
    trendScore: {
      label: assertEnum(trendScore.label, "trend_score.label", trendLabels),
      lifespanWeeks: Math.round(assertNumber(trendScore.lifespan_weeks, "trend_score.lifespan_weeks")),
      confidence: assertNumber(trendScore.confidence, "trend_score.confidence", UNIT_RANGE),
      source: trendSource,
      lastUpdated: assertIsoDate(trendScore.last_updated, "trend_score.last_updated")
    },
    healthScore: {
      label: assertEnum(healthScore.label, "health_score.label", healthLabels),
      flags: assertArray(healthScore.flags, "health_score.flags").map((flag, index) =>
        assertString(flag, `health_score.flags[${index}]`)
      )
    },
    cpwEstimate: {
      estimatedWears: Math.round(assertNumber(cpwEstimate.estimated_wears, "cpw_estimate.estimated_wears")),
      costPerWear: assertNumber(cpwEstimate.cost_per_wear, "cpw_estimate.cost_per_wear"),
      trendAdjustedWears: Math.round(
        assertNumber(cpwEstimate.trend_adjusted_wears, "cpw_estimate.trend_adjusted_wears")
      ),
      trendAdjustedCpw: assertNumber(
        cpwEstimate.trend_adjusted_cpw,
        "cpw_estimate.trend_adjusted_cpw"
      ),
      fiberDataAvailable: typeof cpwEstimate.fiber_data_available === "boolean"
        ? cpwEstimate.fiber_data_available
        : true
    },
    dataSources: {
      googleTrends: {
        available: googleTrendsAvailable,
        lastUpdated: assertIsoDate(
          googleTrendsSource.last_updated,
          "data_sources.google_trends.last_updated"
        )
      },
      esgApi: {
        available: esgAvailable,
        provider: assertString(esgDataSource.provider, "data_sources.esg_api.provider"),
        lastUpdated: assertIsoDate(esgDataSource.last_updated, "data_sources.esg_api.last_updated")
      }
    },
    webAppDeepLink: assertString(root.web_app_deep_link, "web_app_deep_link")
  };
};
