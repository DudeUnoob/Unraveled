import type { ProductContext, ScoreResult } from "../types";

/**
 * Only treat CPW as displayable currency when we have a real price signal from the scorer.
 * Avoids showing misleading $0.00 when price was missing (backend uses 0 as sentinel).
 */
export function isCpwPriceAvailable(
  cpw: ScoreResult["cpwEstimate"],
  _product: ProductContext,
): boolean {
  if (cpw.priceAvailable === false) {
    return false;
  }

  const hasNumeric =
    (Number.isFinite(cpw.costPerWear) && cpw.costPerWear > 0) ||
    (Number.isFinite(cpw.trendAdjustedCpw) && cpw.trendAdjustedCpw > 0);

  if (cpw.priceAvailable === true) {
    return hasNumeric;
  }

  // Older API responses without price_available: only trust non-zero CPW values.
  return hasNumeric;
}
