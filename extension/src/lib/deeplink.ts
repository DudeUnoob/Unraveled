import { UNRAVEL_WEB_APP_BASE_URL } from "../config/runtime";
import type { ProductContext, ScoreResult } from "../types";

const WEB_APP_ANALYZE_URL = `${UNRAVEL_WEB_APP_BASE_URL}/analyze`;

export const buildWebAppDeepLink = (
  product: ProductContext,
  score: Pick<ScoreResult, "sustainabilityScore" | "trendScore" | "cpwEstimate" | "healthScore">
): string => {
  const params = new URLSearchParams({
    source: "extension",
    product_name: product.productName,
    product_url: product.productUrl,
    brand: product.brand,
    sustainability_score: String(score.sustainabilityScore.value),
    sustainability_grade: score.sustainabilityScore.grade,
    trend_label: score.trendScore.label,
    trend_lifespan_weeks: String(score.trendScore.lifespanWeeks),
    cpw: score.cpwEstimate.costPerWear.toFixed(2),
    cpw_adjusted: score.cpwEstimate.trendAdjustedCpw.toFixed(2),
    health_label: score.healthScore.label
  });

  if (product.price) {
    params.set("price", String(product.price));
    params.set("currency", product.currency);
  }

  return `${WEB_APP_ANALYZE_URL}?${params.toString()}`;
};
