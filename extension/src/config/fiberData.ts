import type { TrendLabel } from "../types";

/**
 * Fiber sustainability ranks — higher = more sustainable.
 * Kept in exact sync with the edge function `score/index.ts`.
 */
export const FIBER_RANKS: Record<string, number> = {
  // Premium Natural Fibers
  "organic linen": 0.95,
  linen: 0.82,
  hemp: 0.92,
  "organic cotton": 0.9,
  "bamboo": 0.87,
  "tencel/lyocell": 0.88,
  "alpaca": 0.86,
  "mohair": 0.85,
  "recycled wool": 0.85,
  wool: 0.78,
  silk: 0.72,
  cotton: 0.65,
  "recycled polyester": 0.6,
  "recycled nylon": 0.58,
  "recycled cotton": 0.75,
  "modal": 0.55,
  "acetate": 0.4,
  "triacetate": 0.42,

  // Conventional Natural
  // "cotton": 0.65,
  // "linen": 0.8,
  "flax": 0.8,

  // Conventional Synthetics
  "viscose/rayon": 0.45,
  "nylon/spandex blend": 0.3,
  "polyester": 0.25,
  "nylon": 0.35,
  "spandex": 0.2,
  "lycra": 0.2,
  "acrylic": 0.2,
  "polyamide": 0.35,
  "polypropylene": 0.3,
  "elastane": 0.2,

  // Specialty & Other
  "leather": 0.15,
  "suede": 0.15,
  "fur": 0.1,
  "down": 0.3,
  "feathers": 0.3,
  "kapok": 0.7,
  "coir": 0.6,
  "ramie": 0.75,
  "nettle": 0.7,
  "abaca": 0.65,
  "sisal": 0.6
};

/**
 * Alias map for canonical fiber names.
 * Kept in exact sync with the edge function `score/index.ts`.
 */
export const FIBER_ALIASES: Record<string, string[]> = {
  // Premium Natural Fibers
  "organic linen": ["organic linen", "organic-flax linen", "eco linen"],
  "silk": ["silk", "mulberry silk", "charmeuse", "crepe de chine", "dupioni", "shantung"],
  "cashmere": ["cashmere", "pashmina", "cashmere wool"],
  "hemp": ["hemp", "industrial hemp", "hemp fiber"],
  "organic cotton": ["organic cotton", "gots cotton", "organic pima cotton"],
  "bamboo": ["bamboo", "bamboo viscose", "bamboo fiber", "bamboo linen"],
  "tencel/lyocell": ["tencel", "lyocell", "modal tencel", "refibra"],
  "alpaca": ["alpaca", "alpaca wool", "baby alpaca"],
  "mohair": ["mohair", "mohair wool", "angora mohair"],
  "recycled wool": ["recycled wool", "regenerated wool"],
  "wool": ["wool", "virgin wool", "sheep wool", "merino wool", "lambswool", "worsted wool"],
  "jute": ["jute", "hessian", "burlap"],

  // Sustainable Synthetics
  "recycled polyester": ["recycled polyester", "recycled poly", "rpet", "recycled pet"],
  "recycled nylon": ["recycled nylon", "recycled polyamide", "recycled pa"],
  "recycled cotton": ["recycled cotton", "regenerated cotton"],
  "modal": ["modal", "modal cotton", "lenzing modal"],
  "acetate": ["acetate", "cellulose acetate"],
  "triacetate": ["triacetate", "tricel"],

  // Conventional Natural
  "cotton": ["cotton", "conventional cotton", "pima cotton", "egyptian cotton", "supima cotton"],
  "linen": ["linen", "flax linen"],
  "flax": ["flax", "flax fiber"],

  // Conventional Synthetics
  "viscose/rayon": ["viscose", "rayon", "artificial silk", "cupro"],
  "nylon/spandex blend": ["nylon spandex", "polyamide elastane"],
  "polyester": ["polyester", "poly", "dacron", "terylene"],
  "nylon": ["nylon", "polyamide", "pa", "nylon 6", "nylon 6,6"],
  "spandex": ["spandex", "elastane"],
  "lycra": ["lycra", "invista lycra"],
  "acrylic": ["acrylic", "polyacrylic", "orlon", "acrylonitrile"],
  "polyamide": ["polyamide", "pa"],
  "polypropylene": ["polypropylene", "pp", "olefin"],
  "elastane": ["elastane", "spandex"],

  // Specialty & Other
  "leather": ["leather", "genuine leather", "top grain leather", "full grain leather"],
  "suede": ["suede", "sueded leather"],
  "fur": ["fur", "real fur", "genuine fur"],
  "down": ["down", "duck down", "goose down"],
  "feathers": ["feathers", "duck feathers", "goose feathers"],
  "kapok": ["kapok", "kapok fiber", "ceiba fiber"],
  "coir": ["coir", "coconut coir", "coconut fiber"],
  "ramie": ["ramie", "china grass", "ramie fiber"],
  "nettle": ["nettle", "stinging nettle fiber"],
  "abaca": ["abaca", "manila hemp", "abaca fiber"],
  "sisal": ["sisal", "sisal hemp", "agave fiber"]
};

/**
 * Estimated total wears per fiber type before garment degrades.
 * Kept in exact sync with the edge function `score/index.ts`.
 */
export const FIBER_DURABILITY_WEARS: Record<string, number> = {
  // Premium Natural Fibers
  "organic linen": 90,
  linen: 85,
  hemp: 88,
  "organic cotton": 82,
  "bamboo": 75,
  "tencel/lyocell": 74,
  "alpaca": 70,
  "mohair": 65,
  "recycled wool": 78,
  wool: 75,
  silk: 60,
  cotton: 62,
  "recycled polyester": 56,
  "recycled nylon": 54,
  "recycled cotton": 70,
  "modal": 65,
  "acetate": 40,
  "triacetate": 42,

  // Conventional Natural
  // "cotton": 62,
  // "linen": 85,
  "flax": 85,

  // Conventional Synthetics
  "viscose/rayon": 45,
  "nylon/spandex blend": 38,
  "polyester": 34,
  "nylon": 50,
  "spandex": 25,
  "lycra": 25,
  "acrylic": 28,
  "polyamide": 50,
  "polypropylene": 35,
  "elastane": 25,

  // Specialty & Other
  "leather": 100,
  "suede": 95,
  "fur": 90,
  "down": 50,
  "feathers": 45,
  "kapok": 55,
  "coir": 40,
  "ramie": 70,
  "nettle": 65,
  "abaca": 60,
  "sisal": 45
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
