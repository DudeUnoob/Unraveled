import { FIBER_ALIASES } from "../config/fiberData";

/**
 * Normalize a candidate string for fiber matching.
 * Keeps forward-slashes (important for "viscose/rayon") and hyphens.
 */
const normalizeCandidate = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9/\s-]/g, " ").replace(/\s+/g, " ").trim();

/**
 * Sort aliases longest-first so "organic cotton" beats "cotton".
 * Built once at module load for performance.
 */
const SORTED_ALIAS_ENTRIES: Array<[string, string[]]> = Object.entries(FIBER_ALIASES)
  .sort(([a], [b]) => b.length - a.length);

/**
 * Match a fiber name string to its canonical name.
 *
 * Uses `includes()` instead of word-boundary regex. The previous `\b` approach
 * broke because `normalizeCandidate` strips the characters that regex word
 * boundaries depend on, causing false negatives for common fibers like
 * "cotton", "polyester", and "modal".
 */
const canonicalizeFiber = (value: string): string | null => {
  const normalized = normalizeCandidate(value);

  for (const [canonical, aliases] of SORTED_ALIAS_ENTRIES) {
    for (const alias of aliases) {
      if (normalized.includes(alias.toLowerCase())) {
        return canonical;
      }
    }
  }

  return null;
};

const clampPct = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
};

/**
 * Parse raw fiber text into a canonical composition map.
 *
 * Handles these common formats from retailer product pages:
 *   - "80% Cotton, 20% Polyester"
 *   - "Cotton 80%, Polyester 20%"
 *   - "Material: 80% Cotton / 20% Polyester"
 *   - Multi-line with one fiber per line
 */
export const parseFiberComposition = (rawText: string): Record<string, number> => {
  const text = rawText.toLowerCase();

  // Keep the raw text intact so percentages survive parsing.
  const enrichedText = text;

  const seenSegments = new Set<string>();
  const segments = enrichedText
    .split(/[\n;,|•·]+|(?:\s\/\s)/)
    .map((segment) => segment.trim())
    .filter((segment) => {
      if (!segment) {
        return false;
      }
      const key = normalizeCandidate(segment);
      if (!key || seenSegments.has(key)) {
        return false;
      }
      seenSegments.add(key);
      return true;
    });

  const composition: Record<string, number> = {};

  for (const segment of segments) {
    // Pattern 1: "80% cotton" (percent first)
    const percentFirst = segment.match(/(\d{1,3}(?:\.\d+)?)\s*%\s*([a-z][a-z\s/-]{1,50})/i);
    // Pattern 2: "cotton 80%" (name first)
    const nameFirst = segment.match(/([a-z][a-z\s/-]{1,50})\s*(\d{1,3}(?:\.\d+)?)\s*%/i);

    const value = percentFirst?.[1] ?? nameFirst?.[2];
    const name = percentFirst?.[2] ?? nameFirst?.[1];

    if (!value || !name) {
      continue;
    }

    const canonical = canonicalizeFiber(name);
    if (!canonical) {
      continue;
    }

    composition[canonical] = Number(
      ((composition[canonical] ?? 0) + clampPct(parseFloat(value))).toFixed(2)
    );
  }

  if (Object.keys(composition).length === 0) {
    for (const segment of segments) {
      const canonical = canonicalizeFiber(segment);
      if (!canonical) {
        continue;
      }
      composition[canonical] = 100;
      break;
    }
  }

  return composition;
};

export const normalizeFiberComposition = (
  composition: Record<string, number>
): Record<string, number> => {
  const entries = Object.entries(composition).filter(([, pct]) => pct > 0);
  const total = entries.reduce((sum, [, pct]) => sum + pct, 0);

  if (!entries.length || total === 0) {
    return {};
  }

  if (total <= 100) {
    return Object.fromEntries(entries.map(([fiber, pct]) => [fiber, Number(pct.toFixed(2))]));
  }

  return Object.fromEntries(
    entries.map(([fiber, pct]) => [fiber, Number(((pct / total) * 100).toFixed(2))])
  );
};
