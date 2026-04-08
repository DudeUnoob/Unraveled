import type { TrendLabel } from "../types";

/**
 * Fiber sustainability ranks — higher = more sustainable.
 * Kept in exact sync with the edge function `score/index.ts`.
 */
export const FIBER_RANKS: Record<string, number> = {
  "organic linen": 0.95,
  linen: 0.82,
  hemp: 0.92,
  "organic cotton": 0.9,
  "tencel/lyocell": 0.88,
  "recycled wool": 0.85,
  wool: 0.78,
  silk: 0.72,
  cotton: 0.65,
  "recycled polyester": 0.6,
  "viscose/rayon": 0.45,
  "nylon/spandex blend": 0.3,
  polyester: 0.25,
  acrylic: 0.2
};

/**
 * Alias map for canonical fiber names.
 * Kept in exact sync with the edge function `score/index.ts`.
 */
export const FIBER_ALIASES: Record<string, string[]> = {
  "organic linen": ["organic linen", "organic-flax linen"],
  linen: ["linen", "flax"],
  hemp: ["hemp"],
  "organic cotton": ["organic cotton"],
  "tencel/lyocell": ["tencel", "lyocell"],
  "recycled wool": ["recycled wool"],
  wool: ["wool", "merino", "cashmere", "alpaca", "mohair", "angora"],
  silk: ["silk", "mulberry silk"],
  cotton: ["cotton", "conventional cotton", "pima cotton", "supima"],
  "recycled polyester": ["recycled polyester", "recycled poly", "repreve"],
  "viscose/rayon": ["viscose", "rayon", "modal", "bamboo viscose", "ecovero"],
  "nylon/spandex blend": ["nylon", "spandex", "elastane", "polyamide", "lycra"],
  polyester: ["polyester", "poly"],
  acrylic: ["acrylic"]
};

/**
 * Estimated total wears per fiber type before garment degrades.
 * Kept in exact sync with the edge function `score/index.ts`.
 */
export const FIBER_DURABILITY_WEARS: Record<string, number> = {
  "organic linen": 90,
  linen: 85,
  hemp: 88,
  "organic cotton": 82,
  "tencel/lyocell": 74,
  "recycled wool": 78,
  wool: 75,
  silk: 60,
  cotton: 62,
  "recycled polyester": 56,
  "viscose/rayon": 45,
  "nylon/spandex blend": 38,
  polyester: 34,
  acrylic: 28
};

export const TREND_FEATURE_MAP: Record<TrendLabel, number> = {
  Timeless: 1,
  Trending: 0.75,
  Fading: 0.4,
  Dead: 0.1
};

export const TREND_LIFESPAN_WEEKS: Record<TrendLabel, number> = {
  Timeless: 52,
  Trending: 14,
  Fading: 7,
  Dead: 3
};

export const TREND_WEAR_MULTIPLIER: Record<TrendLabel, number> = {
  Timeless: 1,
  Trending: 0.72,
  Fading: 0.48,
  Dead: 0.28
};

export const HEALTH_HAZARD_PATTERNS = {
  avoid: [
    /formaldehyde/i,
    /wrinkle[-\s]?free/i,
    /pfas/i,
    /perfluoro/i,
    /stain[-\s]?resistant/i,
    /water[-\s]?repellent/i
  ],
  caution: [/polyester/i, /acrylic/i]
};

export const DEFAULT_FIBER_FEATURE = 0.35;
export const DEFAULT_DURABILITY_WEARS = 50;
