import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  fetchGoogleTrendsTimeline,
  MAX_GOOGLE_TRENDS_CANDIDATE_ATTEMPTS,
  type TimelinePoint,
} from "../_shared/serpapi.ts";
import { fetchPinterestRapidSignal } from "../_shared/pinterestRapid.ts";
import {
  buildScoreTrendQuerySeed,
  buildTrendQueryCandidates,
  normalizeQueryKey,
} from "../_shared/trendQueries.ts";
import { completeStructuredJson } from "../_shared/llmRouter.ts";

const FIBER_RANKS: Record<string, number> = {
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
  acrylic: 0.2,
};

const FIBER_ALIASES: Record<string, string[]> = {
  "organic linen": ["organic linen", "organic-flax linen"],
  linen: ["linen", "flax"],
  hemp: ["hemp"],
  "organic cotton": ["organic cotton"],
  "tencel/lyocell": ["tencel", "lyocell"],
  "recycled wool": ["recycled wool"],
  wool: ["wool", "merino", "cashmere"],
  silk: ["silk"],
  cotton: ["cotton", "conventional cotton"],
  "recycled polyester": ["recycled polyester", "recycled poly"],
  "viscose/rayon": ["viscose", "rayon", "modal"],
  "nylon/spandex blend": ["nylon", "spandex", "elastane", "polyamide"],
  polyester: ["polyester"],
  acrylic: ["acrylic"],
};

const FIBER_DURABILITY_WEARS: Record<string, number> = {
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
  acrylic: 28,
};

const CATEGORY_DEFAULT_WEARS: Record<string, number> = {
  tops: 50,
  shirts: 50,
  "t-shirts": 50,
  blouses: 45,
  bottoms: 55,
  pants: 55,
  jeans: 60,
  skirts: 45,
  shorts: 40,
  dresses: 45,
  outerwear: 80,
  coats: 80,
  jackets: 75,
  sweaters: 55,
  shoes: 70,
  boots: 75,
  sneakers: 60,
  sandals: 40,
  accessories: 60,
  bags: 80,
  apparel: 50,
};

const TREND_FEATURE_MAP: Record<string, number> = {
  Timeless: 1.0,
  Trending: 0.75,
  Fading: 0.4,
  Dead: 0.1,
};

const TREND_WEAR_MULTIPLIER: Record<string, number> = {
  Timeless: 1.0,
  Trending: 0.72,
  Fading: 0.48,
  Dead: 0.28,
};

const HEALTH_AVOID_PATTERNS = [
  /formaldehyde/i,
  /wrinkle[-\s]?free/i,
  /pfas/i,
  /perfluoro/i,
  /stain[-\s]?resistant/i,
  /water[-\s]?repellent/i,
];

const HEALTH_CAUTION_PATTERNS = [/polyester/i, /acrylic/i];

const DEFAULT_FIBER_FEATURE = 0.35;
const DEFAULT_DURABILITY_WEARS = 50;
const WEIGHTS_FULL = { fiber: 0.5, brand: 0.3, trend: 0.2 };
const WEIGHTS_MANUAL = { fiber: 0.7, brand: 0.0, trend: 0.3 };
const TIKTOK_API_BASE = "https://tiktok-api23.p.rapidapi.com";
const TREND_CACHE_TTL_HOURS = 12;

const WEB_APP_BASE_URL =
  (Deno.env.get("WEB_APP_BASE_URL") ?? "https://unraveled-kappa.vercel.app")
    .replace(/\/+$/, "");

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

function canonicalizeFiber(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (FIBER_RANKS[lower] !== undefined) {
    return lower;
  }

  const entries = Object.entries(FIBER_ALIASES).sort((a, b) =>
    b[0].length - a[0].length
  );
  for (const [canonical, aliases] of entries) {
    if (aliases.some((alias) => lower.includes(alias))) {
      return canonical;
    }
  }
  return null;
}

const MAX_FIBER_EXCERPT_CHARS = 12_000;

const normalizeFiberPercentages = (
  composition: Record<string, number>,
): Record<string, number> => {
  const entries = Object.entries(composition).filter(([, value]) =>
    Number.isFinite(value) && value > 0
  );
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (entries.length === 0 || total <= 0) {
    return {};
  }

  const ratio = total > 100 ? 100 / total : 1;
  return Object.fromEntries(
    entries.map(([fiber, value]) => [fiber, Number((value * ratio).toFixed(2))]),
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const canonicalizeFiberContentInput = (
  rawInput: Record<string, unknown>,
): Record<string, number> => {
  const canonicalized: Record<string, number> = {};

  for (const [fiber, rawValue] of Object.entries(rawInput)) {
    const canonical = canonicalizeFiber(fiber);
    if (!canonical) {
      continue;
    }

    const numeric = typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string"
      ? Number(rawValue)
      : NaN;
    if (!Number.isFinite(numeric) || numeric <= 0) {
      continue;
    }

    canonicalized[canonical] = (canonicalized[canonical] ?? 0) + numeric;
  }

  return normalizeFiberPercentages(canonicalized);
};

const isLikelyCanonicalComposition = (composition: Record<string, number>): boolean => {
  const entries = Object.entries(composition);
  if (entries.length === 0) {
    return false;
  }

  const hasUnknownKeys = entries.some(([fiber]) => !canonicalizeFiber(fiber));
  if (hasUnknownKeys) {
    return false;
  }

  const total = entries.reduce((sum, [, value]) => sum + (Number.isFinite(value) ? value : 0), 0);
  return total >= 99 && total <= 101;
};

const buildFiberExcerpt = (
  descriptionText: string,
  materialExcerpt: string,
): string => {
  const merged = [materialExcerpt, descriptionText]
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n\n");

  if (merged.length <= MAX_FIBER_EXCERPT_CHARS) {
    return merged;
  }

  return merged.slice(0, MAX_FIBER_EXCERPT_CHARS);
};

const parseLlmFiberMap = (raw: unknown): Record<string, number> | null => {
  if (typeof raw !== "object" || raw === null || !("fibers" in raw)) {
    return null;
  }

  const fibers = (raw as { fibers?: unknown }).fibers;
  if (!Array.isArray(fibers)) {
    return null;
  }

  const parsed: Record<string, number> = {};
  for (const entry of fibers) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }

    const item = entry as { canonical?: unknown; name?: unknown; pct?: unknown };
    const nameCandidate = typeof item.canonical === "string"
      ? item.canonical
      : typeof item.name === "string"
      ? item.name
      : "";
    const canonical = canonicalizeFiber(nameCandidate);
    if (!canonical) {
      continue;
    }

    const rawPct = typeof item.pct === "number"
      ? item.pct
      : typeof item.pct === "string"
      ? Number(item.pct)
      : NaN;

    if (!Number.isFinite(rawPct) || rawPct <= 0) {
      continue;
    }

    parsed[canonical] = (parsed[canonical] ?? 0) + clamp(rawPct, 0, 100);
  }

  const normalized = normalizeFiberPercentages(parsed);
  return Object.keys(normalized).length > 0 ? normalized : null;
};

async function extractFiberCompositionWithLlm(
  productName: string,
  brand: string,
  category: string,
  excerpt: string,
): Promise<{ composition: Record<string, number>; provider: "groq" | "gemini" } | null> {
  if (!excerpt.trim()) {
    return null;
  }

  const llmResult = await completeStructuredJson(
    {
      schemaName: "fiber_composition",
      systemPrompt:
        "You extract apparel fiber composition into canonical labels. " +
        "Return JSON only. Use percentages when present and avoid guessing fibers not mentioned.",
      userPrompt:
        `Product: ${productName}\nBrand: ${brand}\nCategory: ${category}\n\n` +
        `Text excerpt:\n${excerpt}`,
      jsonSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          fibers: {
            type: "array",
            minItems: 1,
            maxItems: 12,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                canonical: { type: "string" },
                name: { type: "string" },
                pct: { type: "number", minimum: 0, maximum: 100 },
              },
              required: ["pct"],
            },
          },
        },
        required: ["fibers"],
      },
      maxTokens: 400,
      temperature: 0.1,
    },
    parseLlmFiberMap,
  );

  if (!llmResult) {
    return null;
  }

  return {
    composition: llmResult.data,
    provider: llmResult.provider,
  };
}

interface TikTokSignal {
  available: boolean;
  hashtag_views: number | null;
  post_count: number | null;
  normalized_score: number;
}

async function fetchTikTokSignal(
  query: string,
  apiKey: string,
): Promise<TikTokSignal> {
  try {
    const headers = {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "tiktok-api23.p.rapidapi.com",
    };

    const hashtagName = query.replace(/\s+/g, "").toLowerCase();
    const discoverUrl =
      `${TIKTOK_API_BASE}/api/post/discover?keyword=${encodeURIComponent(query)}&count=20`;
    const hashtagUrl =
      `${TIKTOK_API_BASE}/api/challenge/info?challenge_name=${
        encodeURIComponent(
          hashtagName,
        )
      }`;

    const [discoverRes, hashtagRes] = await Promise.all([
      fetch(discoverUrl, { headers, signal: AbortSignal.timeout(8000) }).catch(
        () => null,
      ),
      fetch(hashtagUrl, { headers, signal: AbortSignal.timeout(8000) }).catch(
        () => null,
      ),
    ]);

    let postCount: number | null = null;
    let totalEngagement = 0;
    let hashtagViews: number | null = null;

    if (discoverRes && discoverRes.ok) {
      const discoverData = await discoverRes.json();
      const items = discoverData?.item_list ?? discoverData?.items ?? [];
      if (Array.isArray(items) && items.length > 0) {
        postCount = items.length;
        for (const item of items) {
          const stats = item.statistics ?? item.stats ?? {};
          totalEngagement +=
            (stats.digg_count ?? stats.diggCount ?? stats.likesCount ?? 0) +
            (stats.play_count ?? stats.playCount ?? stats.viewsCount ?? 0);
        }
      }
    }

    if (hashtagRes && hashtagRes.ok) {
      const hashtagData = await hashtagRes.json();
      const challenge = hashtagData?.challenge_info ?? hashtagData?.challengeInfo ??
        hashtagData;
      const views = challenge?.stats?.view_count ?? challenge?.stats?.viewCount ??
        challenge?.view_count ?? challenge?.viewCount ?? null;
      if (typeof views === "number" && views > 0) {
        hashtagViews = views;
      }
    }

    if (postCount === null && hashtagViews === null) {
      return {
        available: false,
        hashtag_views: null,
        post_count: null,
        normalized_score: 0,
      };
    }

    let normalized = 0;
    if (hashtagViews && hashtagViews > 0) {
      normalized = Math.max(
        normalized,
        clamp(Math.round((Math.log10(hashtagViews) - 3) * 19), 0, 100),
      );
    }
    if (totalEngagement > 0) {
      normalized = Math.max(
        normalized,
        clamp(Math.round((Math.log10(totalEngagement) - 3) * 22), 0, 100),
      );
    }

    return {
      available: true,
      hashtag_views: hashtagViews,
      post_count: postCount,
      normalized_score: normalized,
    };
  } catch (err) {
    console.error("TikTok signal fetch failed:", err);
    return {
      available: false,
      hashtag_views: null,
      post_count: null,
      normalized_score: 0,
    };
  }
}

interface PinterestSignal {
  available: boolean;
  board_count: number | null;
  total_results: number | null;
  normalized_score: number;
}

function adjustConfidence(
  baseConfidence: number,
  baseLabel: string,
  tiktokSignal: TikTokSignal,
  pinterestSignal: PinterestSignal,
): number {
  let adjustment = 0;

  if (tiktokSignal.available) {
    const tiktokScore = tiktokSignal.normalized_score;
    if (baseLabel === "Trending" && tiktokScore > 50) {
      adjustment += 0.08;
    } else if (baseLabel === "Fading" && tiktokScore > 60) {
      adjustment -= 0.05;
    } else if (baseLabel === "Dead" && tiktokScore > 40) {
      adjustment -= 0.06;
    } else if (baseLabel === "Timeless" && tiktokScore > 30) {
      adjustment += 0.05;
    }
  }

  if (pinterestSignal.available) {
    const pinterestScore = pinterestSignal.normalized_score;
    if (baseLabel === "Trending" && pinterestScore > 50) {
      adjustment += 0.05;
    } else if (baseLabel === "Fading" && pinterestScore > 60) {
      adjustment -= 0.03;
    } else if (baseLabel === "Timeless" && pinterestScore > 40) {
      adjustment += 0.04;
    }
  }

  return clamp(baseConfidence + adjustment, 0.1, 0.99);
}

interface FiberBreakdownItem {
  fiber: string;
  pct: number;
  rank: number;
  weighted: number;
}

function computeFiberScore(
  fiberContent: Record<string, number>,
): {
  featureValue: number;
  breakdown: FiberBreakdownItem[];
  fiberDataAvailable: boolean;
} {
  const breakdown: FiberBreakdownItem[] = [];
  let weightedSum = 0;
  let totalPct = 0;
  let knownFiberCount = 0;

  for (const [fiberName, pct] of Object.entries(fiberContent)) {
    const canonical = canonicalizeFiber(fiberName);
    const resolvedName = canonical ?? fiberName.toLowerCase();
    const rank = FIBER_RANKS[resolvedName] ?? 0.35;
    const weighted = pct * rank;
    weightedSum += weighted;
    totalPct += pct;
    if (canonical !== null) {
      knownFiberCount++;
    }
    breakdown.push({ fiber: fiberName, pct, rank, weighted });
  }

  const fiberDataAvailable = knownFiberCount > 0;
  const featureValue = totalPct > 0
    ? clamp(weightedSum / 100, 0, 1)
    : DEFAULT_FIBER_FEATURE;
  return { featureValue, breakdown, fiberDataAvailable };
}

function computeHealthScore(
  fiberContent: Record<string, number>,
  descriptionText: string,
): { label: string; flags: string[] } {
  const flags: string[] = [];
  const textToCheck = [...Object.keys(fiberContent), descriptionText].join(" ");

  for (const pattern of HEALTH_AVOID_PATTERNS) {
    if (pattern.test(textToCheck)) {
      const match = textToCheck.match(pattern);
      if (match) {
        flags.push(match[0]);
      }
    }
  }
  if (flags.length > 0) {
    return { label: "Avoid", flags };
  }

  const cautionFlags: string[] = [];
  for (const pattern of HEALTH_CAUTION_PATTERNS) {
    if (pattern.test(textToCheck)) {
      const match = textToCheck.match(pattern);
      if (match) {
        cautionFlags.push(match[0]);
      }
    }
  }
  if (cautionFlags.length > 0) {
    return { label: "Caution", flags: cautionFlags };
  }

  return { label: "Safe", flags: [] };
}

function classifyTrendByKeywords(
  productName: string,
  category: string,
): { label: string; lifespanWeeks: number; confidence: number } {
  const text = `${productName} ${category}`.toLowerCase();

  const timelessKw = [
    "classic",
    "essential",
    "basic",
    "staple",
    "timeless",
    "heritage",
    "plain",
    "solid",
    "crew neck",
    "straight leg",
    "oxford",
    "chino",
    "denim",
    "white tee",
    "white shirt",
    "trench",
    "polo",
  ];
  const deadKw = [
    "limited edition",
    "collab",
    "drop",
    "capsule",
    "x ",
    "collection",
  ];
  const fadingKw = [
    "seasonal",
    "holiday",
    "spring",
    "summer",
    "fall",
    "winter",
    "valentine",
    "halloween",
  ];

  if (timelessKw.some((kw) => text.includes(kw))) {
    return { label: "Timeless", lifespanWeeks: 52, confidence: 0.30 };
  }
  if (deadKw.some((kw) => text.includes(kw))) {
    return { label: "Dead", lifespanWeeks: 3, confidence: 0.30 };
  }
  if (fadingKw.some((kw) => text.includes(kw))) {
    return { label: "Fading", lifespanWeeks: 7, confidence: 0.30 };
  }

  return { label: "Trending", lifespanWeeks: 14, confidence: 0.30 };
}

interface TrendResult {
  label: string;
  lifespanWeeks: number;
  confidence: number;
  fromCache: boolean;
  googleTrendsAvailable: boolean;
  tiktokSignal: TikTokSignal;
  pinterestSignal: PinterestSignal;
  llmProvider: "groq" | "gemini" | null;
  queryUsed: string | null;
}

function analyzeTrendTimeline(
  timeline: TimelinePoint[],
): { label: string; lifespanWeeks: number; confidence: number } {
  if (timeline.length < 4) {
    return { label: "Trending", lifespanWeeks: 14, confidence: 0.40 };
  }

  const values = timeline.map((point) => point.value);
  const n = values.length;

  const sum = values.reduce((a, b) => a + b, 0);
  const historicalAvg = sum / n;

  const recentSlice = values.slice(-4);
  const recentAvg = recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length;

  const peakValue = Math.max(...values);
  const peakIndex = values.lastIndexOf(peakValue);
  const weeksSincePeak = n - 1 - peakIndex;

  const variance =
    values.reduce((acc, value) => acc + (value - historicalAvg) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = historicalAvg > 0 ? stdDev / historicalAvg : 0;

  const trendVelocity = historicalAvg > 0
    ? (recentAvg - historicalAvg) / historicalAvg
    : 0;

  const recentN = Math.min(8, n);
  const recentValues = values.slice(-recentN);
  let slopeSum = 0;
  for (let i = 1; i < recentValues.length; i++) {
    slopeSum += recentValues[i] - recentValues[i - 1];
  }
  const avgSlope = slopeSum / (recentValues.length - 1);

  let label: string;
  let lifespanWeeks: number;
  let confidence: number;

  if (cv < 0.30 && Math.abs(trendVelocity) < 0.20 && recentAvg > 15) {
    label = "Timeless";
    lifespanWeeks = 52;
    confidence = clamp(0.70 + (0.30 - cv) * 0.5, 0.55, 0.95);
  } else if (recentAvg < 5 || (peakValue > 20 && recentAvg < peakValue * 0.15)) {
    label = "Dead";
    lifespanWeeks = Math.max(1, Math.round(weeksSincePeak * 0.3));
    confidence = clamp(
      0.65 + (1 - recentAvg / Math.max(peakValue, 1)) * 0.25,
      0.55,
      0.92,
    );
  } else if (
    weeksSincePeak > 4 && recentAvg < peakValue * 0.60 && avgSlope < -0.5
  ) {
    label = "Fading";
    const currentDeclineRate = Math.abs(avgSlope);
    const remainingInterest = recentAvg - peakValue * 0.25;
    const weeksToFade = currentDeclineRate > 0
      ? Math.round(remainingInterest / currentDeclineRate)
      : 8;
    lifespanWeeks = clamp(weeksToFade, 2, 20);
    confidence = clamp(0.60 + Math.abs(trendVelocity) * 0.3, 0.55, 0.90);
  } else if (trendVelocity > 0.20 || (weeksSincePeak <= 4 && recentAvg > peakValue * 0.75)) {
    label = "Trending";
    if (trendVelocity > 0.8) {
      lifespanWeeks = 6;
    } else if (trendVelocity > 0.4) {
      lifespanWeeks = 12;
    } else {
      lifespanWeeks = 20;
    }
    confidence = clamp(0.60 + Math.abs(trendVelocity) * 0.25, 0.55, 0.90);
  } else {
    label = "Trending";
    lifespanWeeks = 14;
    confidence = 0.50;
  }

  return { label, lifespanWeeks, confidence };
}

async function getCachedTrend(
  supabaseUrl: string,
  supabaseKey: string,
  queryKey: string,
): Promise<TrendResult | null> {
  try {
    const client = createClient(supabaseUrl, supabaseKey);
    const { data } = await client
      .from("trend_cache")
      .select(
        "trend_label, lifespan_weeks, confidence, expires_at, tiktok_signal, pinterest_signal",
      )
      .eq("query_key", queryKey)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (!data) {
      return null;
    }

    const defaultTiktok: TikTokSignal = {
      available: false,
      hashtag_views: null,
      post_count: null,
      normalized_score: 0,
    };
    const defaultPinterest: PinterestSignal = {
      available: false,
      board_count: null,
      total_results: null,
      normalized_score: 0,
    };

    return {
      label: data.trend_label,
      lifespanWeeks: data.lifespan_weeks,
      confidence: data.confidence,
      fromCache: true,
      googleTrendsAvailable: true,
      tiktokSignal: (data.tiktok_signal as TikTokSignal) ?? defaultTiktok,
      pinterestSignal: (data.pinterest_signal as PinterestSignal) ??
        defaultPinterest,
      llmProvider: null,
      queryUsed: null,
    };
  } catch {
    return null;
  }
}

async function cacheTrendResult(
  supabaseUrl: string,
  supabaseKey: string,
  queryKey: string,
  result: TrendResult,
  timeline: TimelinePoint[],
  recentAvg: number,
  peakValue: number,
  weeksSincePeak: number,
): Promise<void> {
  try {
    const client = createClient(supabaseUrl, supabaseKey);
    const expiresAt = new Date(
      Date.now() + TREND_CACHE_TTL_HOURS * 60 * 60 * 1000,
    ).toISOString();

    await client.from("trend_cache").upsert(
      {
        query_key: queryKey,
        trend_label: result.label,
        lifespan_weeks: result.lifespanWeeks,
        confidence: result.confidence,
        raw_timeline: timeline,
        recent_avg: recentAvg,
        peak_value: peakValue,
        weeks_since_peak: weeksSincePeak,
        fetched_at: new Date().toISOString(),
        expires_at: expiresAt,
        tiktok_signal: JSON.parse(JSON.stringify(result.tiktokSignal)),
        pinterest_signal: JSON.parse(JSON.stringify(result.pinterestSignal)),
      },
      { onConflict: "query_key" },
    );
  } catch (err) {
    console.error("Failed to cache trend result:", err);
  }
}

async function classifyTrend(
  productName: string,
  category: string,
): Promise<TrendResult> {
  const serpApiKey = Deno.env.get("SERP_API_KEY");
  const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const defaultTiktok: TikTokSignal = {
    available: false,
    hashtag_views: null,
    post_count: null,
    normalized_score: 0,
  };
  const defaultPinterest: PinterestSignal = {
    available: false,
    board_count: null,
    total_results: null,
    normalized_score: 0,
  };

  if (!serpApiKey) {
    console.warn(
      "SerpAPI is not configured (SERP_API_KEY missing), falling back to keyword classification",
    );
    const fallback = classifyTrendByKeywords(productName, category);
    return {
      ...fallback,
      fromCache: false,
      googleTrendsAvailable: false,
      tiktokSignal: defaultTiktok,
      pinterestSignal: defaultPinterest,
      llmProvider: null,
      queryUsed: null,
    };
  }

  const querySeed = buildScoreTrendQuerySeed(productName, category);
  const queryKey = normalizeQueryKey(querySeed);

  if (supabaseUrl && supabaseKey) {
    const cached = await getCachedTrend(supabaseUrl, supabaseKey, queryKey);
    if (cached) {
      console.log(`Trend cache hit for: "${queryKey}"`);
      return cached;
    }
  }

  const trendCandidatesResult = await buildTrendQueryCandidates(querySeed, "score");
  const trendCandidates = trendCandidatesResult.candidates.length > 0
    ? trendCandidatesResult.candidates
    : [querySeed];

  let timeline: TimelinePoint[] = [];
  let queryUsed: string | null = null;

  const candidatesToTry = trendCandidates.slice(
    0,
    MAX_GOOGLE_TRENDS_CANDIDATE_ATTEMPTS,
  );
  for (const candidate of candidatesToTry) {
    console.log(`Trying Google Trends candidate: "${candidate}"`);
    const attempt = await fetchGoogleTrendsTimeline(candidate, {
      apiKey: serpApiKey,
      date: "today 12-m",
    });

    if (attempt.success && attempt.timeline.length > 0) {
      timeline = attempt.timeline;
      queryUsed = candidate;
      break;
    }
  }

  const socialQuery = queryUsed ?? trendCandidates[0] ?? querySeed;
  let tiktokResult = defaultTiktok;
  let pinterestResult = defaultPinterest;
  if (rapidApiKey) {
    [tiktokResult, pinterestResult] = await Promise.all([
      fetchTikTokSignal(socialQuery, rapidApiKey),
      fetchPinterestRapidSignal(socialQuery, rapidApiKey),
    ]);
  }

  if (!queryUsed || timeline.length === 0) {
    const fallback = classifyTrendByKeywords(productName, category);
    return {
      ...fallback,
      fromCache: false,
      googleTrendsAvailable: false,
      tiktokSignal: tiktokResult,
      pinterestSignal: pinterestResult,
      llmProvider: trendCandidatesResult.llmProvider,
      queryUsed: socialQuery,
    };
  }

  const analysis = analyzeTrendTimeline(timeline);

  const adjustedConfidence = adjustConfidence(
    analysis.confidence,
    analysis.label,
    tiktokResult,
    pinterestResult,
  );

  const result: TrendResult = {
    label: analysis.label,
    lifespanWeeks: analysis.lifespanWeeks,
    confidence: Math.round(adjustedConfidence * 100) / 100,
    fromCache: false,
    googleTrendsAvailable: true,
    tiktokSignal: tiktokResult,
    pinterestSignal: pinterestResult,
    llmProvider: trendCandidatesResult.llmProvider,
    queryUsed,
  };

  if (supabaseUrl && supabaseKey) {
    const values = timeline.map((point) => point.value);
    const recentSlice = values.slice(-4);
    const recentAvg =
      recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length;
    const peakValue = Math.max(...values);
    const peakIndex = values.lastIndexOf(peakValue);
    const weeksSincePeak = values.length - 1 - peakIndex;

    await cacheTrendResult(
      supabaseUrl,
      supabaseKey,
      queryKey,
      result,
      timeline,
      recentAvg,
      peakValue,
      weeksSincePeak,
    );
  }

  return result;
}

function computeCpw(
  price: number | undefined,
  fiberContent: Record<string, number>,
  trendLabel: string,
  category: string,
  fiberDataAvailable: boolean,
): {
  estimated_wears: number;
  cost_per_wear: number;
  trend_adjusted_wears: number;
  trend_adjusted_cpw: number;
  fiber_data_available: boolean;
} {
  let totalWears = 0;
  let totalPct = 0;

  for (const [fiberName, pct] of Object.entries(fiberContent)) {
    const canonical = canonicalizeFiber(fiberName);
    const resolvedName = canonical ?? fiberName.toLowerCase();
    const durability = canonical !== null
      ? (FIBER_DURABILITY_WEARS[resolvedName] ?? DEFAULT_DURABILITY_WEARS)
      : DEFAULT_DURABILITY_WEARS;
    totalWears += pct * durability;
    totalPct += pct;
  }

  let estimatedWears: number;
  if (fiberDataAvailable && totalPct > 0) {
    estimatedWears = Math.round(totalWears / totalPct);
  } else {
    const categoryLower = category.toLowerCase();
    estimatedWears = CATEGORY_DEFAULT_WEARS[categoryLower] ??
      DEFAULT_DURABILITY_WEARS;
  }

  const hasPrice = price != null && price > 0;
  const costPerWear = hasPrice ? price / estimatedWears : 0;

  const trendMultiplier = TREND_WEAR_MULTIPLIER[trendLabel] ?? 0.72;
  const trendAdjustedWears = Math.round(estimatedWears * trendMultiplier);
  const trendAdjustedCpw =
    hasPrice && trendAdjustedWears > 0 ? price / trendAdjustedWears : 0;

  return {
    estimated_wears: estimatedWears,
    cost_per_wear: Math.round(costPerWear * 100) / 100,
    trend_adjusted_wears: trendAdjustedWears,
    trend_adjusted_cpw: Math.round(trendAdjustedCpw * 100) / 100,
    fiber_data_available: fiberDataAvailable,
  };
}

function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 50) return "C";
  if (score >= 25) return "D";
  return "F";
}

function buildDeepLink(
  body: Record<string, unknown>,
  score: number,
  grade: string,
  trendLabel: string,
  lifespanWeeks: number,
  cpw: number,
  adjCpw: number,
  healthLabel: string,
): string {
  const params = new URLSearchParams({
    source: "extension",
    product_name: String(body.product_name ?? ""),
    product_url: String(body.product_url ?? ""),
    brand: String(body.brand ?? ""),
    sustainability_score: String(score),
    sustainability_grade: grade,
    trend_label: trendLabel,
    trend_lifespan_weeks: String(lifespanWeeks),
    cpw: cpw.toFixed(2),
    cpw_adjusted: adjCpw.toFixed(2),
    health_label: healthLabel,
  });
  if (body.price) {
    params.set("price", String(body.price));
    params.set("currency", String(body.currency ?? "USD"));
  }
  return `${WEB_APP_BASE_URL}/analyze?${params.toString()}`;
}

interface BrandRating {
  good_on_you: string;
  bcorp_certified: boolean;
  fti_score: string;
  remake_score: string;
  esg_score: number;
  esg_provider: string;
  normalized_brand_score: number;
}

const DEFAULT_BRAND: BrandRating = {
  good_on_you: "n/a",
  bcorp_certified: false,
  fti_score: "n/a",
  remake_score: "n/a",
  esg_score: 0.4,
  esg_provider: "none",
  normalized_brand_score: 0.4,
};

async function lookupBrand(
  brand: string,
): Promise<{ data: BrandRating; found: boolean }> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return { data: DEFAULT_BRAND, found: false };
    }

    const client = createClient(supabaseUrl, supabaseKey);
    const brandLower = brand.toLowerCase().trim();

    const { data } = await client
      .from("brand_ratings")
      .select(
        "good_on_you, bcorp_certified, fti_score, remake_score, esg_score, esg_provider, normalized_brand_score",
      )
      .ilike("brand_name_lower", `%${brandLower}%`)
      .limit(1)
      .maybeSingle();

    if (!data) {
      return { data: DEFAULT_BRAND, found: false };
    }
    return { data: data as BrandRating, found: true };
  } catch {
    return { data: DEFAULT_BRAND, found: false };
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, x-client-info",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ detail: "Method not allowed" }),
      {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await req.json();

    const productName = String(body.product_name ?? "Unknown Product");
    const brand = String(body.brand ?? "Unknown");
    const category = String(body.category ?? "apparel");
    const descriptionText = String(body.description_text ?? "");
    const materialExcerpt = String(body.material_excerpt ?? "");
    const rawFiberInput = isRecord(body.fiber_content)
      ? body.fiber_content
      : {};
    const clientFiberContent = canonicalizeFiberContentInput(rawFiberInput);
    const price: number | undefined =
      typeof body.price === "number" && body.price > 0 ? body.price : undefined;
    const manualMode = body.manual_mode === true;

    const fiberExcerpt = buildFiberExcerpt(descriptionText, materialExcerpt);
    let normalizedFiberContent = clientFiberContent;
    let llmFiberProvider: "groq" | "gemini" | null = null;

    if (!manualMode && !isLikelyCanonicalComposition(clientFiberContent)) {
      const llmFiberResult = await extractFiberCompositionWithLlm(
        productName,
        brand,
        category,
        fiberExcerpt,
      );
      if (llmFiberResult) {
        normalizedFiberContent = llmFiberResult.composition;
        llmFiberProvider = llmFiberResult.provider;
      }
    }

    const fiber = computeFiberScore(normalizedFiberContent);
    const weights = manualMode ? WEIGHTS_MANUAL : WEIGHTS_FULL;

    let brandData: BrandRating;
    let brandFound: boolean;
    if (manualMode) {
      brandData = DEFAULT_BRAND;
      brandFound = false;
    } else {
      const brandResult = await lookupBrand(brand);
      brandData = brandResult.data;
      brandFound = brandResult.found;
    }
    const brandFeature = manualMode
      ? 0
      : clamp(Number(brandData.normalized_brand_score), 0, 1);

    const trend = await classifyTrend(productName, category);
    const trendFeature = TREND_FEATURE_MAP[trend.label] ?? 0.75;

    const rawScore = (
      fiber.featureValue * weights.fiber +
      brandFeature * weights.brand +
      trendFeature * weights.trend
    ) * 100;
    const sustainabilityValue = Math.round(clamp(rawScore, 0, 100));
    const grade = gradeFromScore(sustainabilityValue);

    const health = computeHealthScore(normalizedFiberContent, descriptionText);
    const cpw = computeCpw(
      price,
      normalizedFiberContent,
      trend.label,
      category,
      fiber.fiberDataAvailable,
    );

    const deepLink = buildDeepLink(
      body,
      sustainabilityValue,
      grade,
      trend.label,
      trend.lifespanWeeks,
      cpw.cost_per_wear,
      cpw.trend_adjusted_cpw,
      health.label,
    );

    const now = new Date().toISOString();
    const llmUsage: string[] = [];
    const llmProviders = new Set<string>();
    if (trend.llmProvider) {
      llmUsage.push("trend_candidates");
      llmProviders.add(trend.llmProvider);
    }
    if (llmFiberProvider) {
      llmUsage.push("fiber_extraction");
      llmProviders.add(llmFiberProvider);
    }

    const response = {
      sustainability_score: {
        value: sustainabilityValue,
        grade,
        model_version: "v1.3-llm-inputs",
        scoring_mode: manualMode ? "fiber_only" : "full",
        feature_contributions: {
          fiber_composition: {
            feature_value: Math.round(fiber.featureValue * 1000) / 1000,
            model_weight: weights.fiber,
            breakdown: fiber.breakdown.map((item) => ({
              fiber: item.fiber,
              pct: item.pct,
              rank: item.rank,
              weighted: Math.round(item.weighted * 100) / 100,
            })),
          },
          brand_reputation: {
            feature_value: manualMode ? 0 : brandFeature,
            model_weight: weights.brand,
            brand_data_available: !manualMode && brandFound,
            sources: {
              good_on_you: brandData.good_on_you,
              bcorp_certified: brandData.bcorp_certified,
              fti_score: brandData.fti_score,
              remake_score: brandData.remake_score || "n/a",
              scrape_signals: "n/a",
              esg_api: {
                provider: brandFound ? brandData.esg_provider : "none",
                score: brandFound
                  ? clamp(Number(brandData.esg_score), 0, 1)
                  : 0,
                last_updated: now,
                available: !manualMode && brandFound,
              },
            },
          },
          micro_trend_longevity: {
            feature_value: trendFeature,
            model_weight: weights.trend,
            trend_label: trend.label,
          },
        },
      },
      trend_score: {
        label: trend.label,
        lifespan_weeks: trend.lifespanWeeks,
        confidence: trend.confidence,
        source: "google_trends" as const,
        last_updated: now,
      },
      health_score: {
        label: health.label,
        flags: health.flags,
      },
      cpw_estimate: cpw,
      data_sources: {
        google_trends: {
          available: trend.googleTrendsAvailable,
          last_updated: now,
          query_used: trend.queryUsed,
        },
        esg_api: {
          available: !manualMode && brandFound,
          provider: brandFound ? brandData.esg_provider : "none",
          last_updated: now,
        },
        tiktok: {
          available: trend.tiktokSignal.available,
          last_updated: now,
          ...(trend.tiktokSignal.available
            ? {
              hashtag_views: trend.tiktokSignal.hashtag_views,
              post_count: trend.tiktokSignal.post_count,
            }
            : {}),
        },
        pinterest: {
          available: trend.pinterestSignal.available,
          last_updated: now,
          ...(trend.pinterestSignal.available
            ? {
              board_count: trend.pinterestSignal.board_count,
              total_results: trend.pinterestSignal.total_results,
            }
            : {}),
        },
        ...(llmUsage.length > 0
          ? {
            llm: {
              available: true,
              providers: Array.from(llmProviders),
              used_for: llmUsage,
              last_updated: now,
            },
          }
          : {}),
      },
      web_app_deep_link: deepLink,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ detail: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
