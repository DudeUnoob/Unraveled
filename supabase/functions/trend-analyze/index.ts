import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  fetchGoogleTrendsTimeline,
  type TimelinePoint,
} from "../_shared/serpapi.ts";

const TIKTOK_API_BASE = "https://tiktok-api23.p.rapidapi.com";
const PINTEREST_API_BASE = "https://pinterest-scraper5.p.rapidapi.com";
const TREND_CACHE_TTL_HOURS = 12;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const WEB_APP_BASE_URL =
  (Deno.env.get("WEB_APP_BASE_URL") ?? "https://unraveled-kappa.vercel.app")
    .replace(/\/+$/, "");

interface CurveDataPoint {
  week: string;
  interest: number;
  source: string;
  projected?: boolean;
}

interface DecayParams {
  K: number;
  r: number;
  t_peak: number;
  lambda: number;
  r_squared: number;
}

interface TrendLifespan {
  label: string;
  color: string;
  score: number;
  peaked_weeks_ago: number;
  weeks_remaining: number;
  confidence: number;
  velocity: number;
}

interface TikTokSignal {
  available: boolean;
  hashtag_views: number | null;
  post_count: number | null;
  normalized_score: number;
}

interface PinterestSignal {
  available: boolean;
  board_count: number | null;
  total_results: number | null;
  normalized_score: number;
}

interface BrandLookupResult {
  name: string;
  found: boolean;
  normalized_score: number;
  good_on_you: string | null;
  bcorp_certified: boolean | null;
  fti_score: string | null;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, x-client-info",
};

function normalizeQueryKey(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, " ");
}

const TREND_QUERY_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "near",
  "of",
  "on",
  "that",
  "the",
  "these",
  "this",
  "those",
  "to",
  "with",
]);

const TREND_QUERY_COLOR_WORDS = new Set([
  "beige",
  "black",
  "blue",
  "brown",
  "burgundy",
  "cream",
  "gold",
  "gray",
  "green",
  "grey",
  "indigo",
  "khaki",
  "lavender",
  "maroon",
  "navy",
  "olive",
  "orange",
  "pink",
  "purple",
  "red",
  "silver",
  "tan",
  "teal",
  "white",
  "yellow",
]);

function uniqQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const query of queries) {
    const normalized = normalizeQueryKey(query);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function buildTrendQueryCandidates(query: string): string[] {
  const base = normalizeQueryKey(
    query
      .replace(/[^\w\s-]/g, " ")
      .replace(/\bfor\s+(women|woman|men|man|girls|boys)\b/g, " ")
      .replace(/\bin\s+[a-z\s]+$/i, " ")
      .replace(/\s+/g, " "),
  );

  const words = base
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => !TREND_QUERY_STOP_WORDS.has(word));

  const withoutColors = words.filter((word) => !TREND_QUERY_COLOR_WORDS.has(word));
  const nounLike = withoutColors.filter((word) =>
    !["best", "cute", "nice", "outfit", "style", "fashion"].includes(word)
  );

  const broadCandidates = [
    nounLike.join(" "),
    withoutColors.join(" "),
    base,
  ];

  const candidates = [...broadCandidates];

  if (nounLike.includes("cargo") && nounLike.includes("pants")) {
    if (nounLike.includes("baggy")) {
      candidates.push("baggy cargo pants");
    }
    candidates.push("cargo pants");
  }

  if (nounLike.includes("jeans") && nounLike.includes("baggy")) {
    candidates.push("baggy jeans");
  }

  const uniqueCandidates = uniqQueries(candidates).filter(Boolean);
  const multiWordCandidates = uniqueCandidates.filter((candidate) =>
    candidate.split(" ").length >= 2
  );

  if (multiWordCandidates.length > 0) {
    return multiWordCandidates;
  }

  return uniqueCandidates.slice(0, 1);
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

    const discoverParams = new URLSearchParams({
      keyword: query,
      count: "20",
    });
    const discoverUrl =
      `${TIKTOK_API_BASE}/api/post/discover?${discoverParams.toString()}`;

    const hashtagName = query.replace(/\s+/g, "").toLowerCase();
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
      const items = discoverData?.itemList ?? discoverData?.item_list ??
        discoverData?.items ?? [];
      if (Array.isArray(items) && items.length > 0) {
        postCount = items.length;
        for (const item of items) {
          const stats = item.statistics ?? item.stats ?? {};
          totalEngagement +=
            (stats.digg_count ?? stats.diggCount ?? stats.likesCount ?? 0) +
            (stats.play_count ?? stats.playCount ?? stats.viewsCount ?? 0);
        }
      } else {
        const responseKeys = discoverData ? Object.keys(discoverData) : [];
        console.warn(
          `TikTok discover returned no items. Response keys: ${
            JSON.stringify(
              responseKeys,
            )
          }`,
        );
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

async function fetchPinterestSignal(
  query: string,
  rapidApiKey: string,
): Promise<PinterestSignal> {
  try {
    const params = new URLSearchParams({
      entry: query,
    });

    const url = `${PINTEREST_API_BASE}/boards?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "pinterest-scraper5.p.rapidapi.com",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(`Pinterest RapidAPI error: ${response.status}`);
      return {
        available: false,
        board_count: null,
        total_results: null,
        normalized_score: 0,
      };
    }

    const data = await response.json();

    const boards = data?.data?.boards;
    if (!Array.isArray(boards) || boards.length === 0) {
      const responseKeys = data ? Object.keys(data) : [];
      console.warn(
        `Pinterest returned no boards. Response keys: ${
          JSON.stringify(
            responseKeys,
          )
        }`,
      );
      return {
        available: false,
        board_count: null,
        total_results: null,
        normalized_score: 0,
      };
    }

    const boardCount = boards.length;
    let totalPins = 0;
    for (const board of boards) {
      if (Array.isArray(board?.objects)) {
        totalPins += board.objects.length;
      }
    }

    let normalized: number;
    if (boardCount >= 10) {
      normalized = clamp(Math.round(70 + (boardCount - 10) * 3), 70, 100);
    } else if (boardCount >= 5) {
      normalized = clamp(Math.round(50 + (boardCount - 5) * 4), 50, 70);
    } else if (boardCount >= 3) {
      normalized = clamp(Math.round(30 + (boardCount - 3) * 10), 30, 50);
    } else {
      normalized = boardCount * 10;
    }

    return {
      available: true,
      board_count: boardCount,
      total_results: totalPins,
      normalized_score: normalized,
    };
  } catch (err) {
    console.error("Pinterest signal fetch failed:", err);
    return {
      available: false,
      board_count: null,
      total_results: null,
      normalized_score: 0,
    };
  }
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

function classifyTrendByKeywords(
  query: string,
): {
  label: string;
  color: string;
  score: number;
  weeksRemaining: number;
  confidence: number;
} {
  const text = query.toLowerCase();

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
    "linen",
    "cashmere",
    "wool",
    "cotton",
    "silk",
    "leather jacket",
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
    "christmas",
  ];

  if (timelessKw.some((kw) => text.includes(kw))) {
    return {
      label: "Timeless",
      color: "green",
      score: 100,
      weeksRemaining: 52,
      confidence: 0.30,
    };
  }
  if (deadKw.some((kw) => text.includes(kw))) {
    return {
      label: "Dead",
      color: "red",
      score: 5,
      weeksRemaining: 1,
      confidence: 0.30,
    };
  }
  if (fadingKw.some((kw) => text.includes(kw))) {
    return {
      label: "Fading",
      color: "orange",
      score: 35,
      weeksRemaining: 7,
      confidence: 0.30,
    };
  }

  return {
    label: "Trending",
    color: "yellow",
    score: 65,
    weeksRemaining: 14,
    confidence: 0.30,
  };
}

function buildFallbackResponse(
  query: string,
  queryKey: string,
  googleTrendsProviderConfigured: boolean,
): Record<string, unknown> {
  const kw = classifyTrendByKeywords(query);
  const now = new Date().toISOString();

  const curveData: CurveDataPoint[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 52 * 7);

  const syntheticValues: number[] = [];
  for (let i = 0; i < 52; i++) {
    let value: number;
    if (kw.label === "Timeless") {
      value = 50 + Math.round(Math.random() * 15 - 7);
    } else if (kw.label === "Trending") {
      value = Math.round(20 + (i / 52) * 60 + Math.random() * 10 - 5);
    } else if (kw.label === "Fading") {
      value = Math.round(
        Math.max(5, 80 - (i / 52) * 60 + Math.random() * 10 - 5),
      );
    } else {
      value = Math.round(Math.max(1, 70 * Math.exp(-i / 12) + Math.random() * 5));
    }
    syntheticValues.push(clamp(value, 0, 100));

    const d = new Date(baseDate);
    d.setDate(d.getDate() + i * 7);
    const year = d.getFullYear();
    const weekNum = Math.ceil(
      ((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7,
    );
    curveData.push({
      week: `${year}-W${String(weekNum).padStart(2, "0")}`,
      interest: syntheticValues[i],
      source: "keyword_estimate",
    });
  }

  const lastVal = syntheticValues[syntheticValues.length - 1];
  const lambda = kw.label === "Timeless"
    ? 0.02
    : kw.label === "Trending"
    ? 0.05
    : 0.12;
  for (let w = 1; w <= 16; w++) {
    const d = new Date();
    d.setDate(d.getDate() + w * 7);
    const year = d.getFullYear();
    const weekNum = Math.ceil(
      ((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7,
    );
    curveData.push({
      week: `${year}-W${String(weekNum).padStart(2, "0")}`,
      interest: Math.max(0, Math.round(lastVal * Math.exp(-lambda * w))),
      source: "projected",
      projected: true,
    });
  }

  const peakValue = Math.max(...syntheticValues);
  const peakIndex = syntheticValues.lastIndexOf(peakValue);

  return {
    analysis_id: `fallback_${Date.now()}`,
    query_normalized: queryKey,
    trend_lifespan: {
      label: kw.label,
      color: kw.color,
      score: kw.score,
      peaked_weeks_ago: syntheticValues.length - 1 - peakIndex,
      weeks_remaining: kw.weeksRemaining,
      confidence: kw.confidence,
      velocity: 0,
    },
    trend_curve: {
      data_points: curveData,
      peak_week: curveData[peakIndex]?.week ?? curveData[0].week,
      death_week: curveData[curveData.length - 1].week,
      model_type: "keyword_fallback",
      r_squared: 0,
    },
    decay_params: {
      K: peakValue,
      r: 0,
      t_peak: peakIndex,
      lambda,
      r_squared: 0,
    },
    data_sources: {
      google_trends: {
        available: false,
        serp_key_configured: googleTrendsProviderConfigured,
        last_updated: now,
        from_cache: false,
        note: googleTrendsProviderConfigured
          ? "Google Trends returned no usable data for this query. Results are keyword-based estimates."
          : "Google Trends provider is not configured. Results are keyword-based estimates.",
      },
      tiktok: { available: false, last_updated: now },
      pinterest: { available: false, last_updated: now },
    },
    shareable_url: null,
  };
}

async function getCachedTimeline(
  supabaseUrl: string,
  supabaseKey: string,
  queryKey: string,
): Promise<{ timeline: TimelinePoint[]; meta: Record<string, unknown> } | null> {
  try {
    const client = createClient(supabaseUrl, supabaseKey);
    const { data } = await client
      .from("trend_cache")
      .select("*")
      .eq("query_key", queryKey)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (!data || !data.raw_timeline) {
      return null;
    }

    return {
      timeline: data.raw_timeline as TimelinePoint[],
      meta: data as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}

async function cacheTrendData(
  supabaseUrl: string,
  supabaseKey: string,
  queryKey: string,
  label: string,
  lifespanWeeks: number,
  confidence: number,
  timeline: TimelinePoint[],
  recentAvg: number,
  peakValue: number,
  weeksSincePeak: number,
  tiktokSignal: TikTokSignal | null,
  pinterestSignal: PinterestSignal | null,
): Promise<void> {
  try {
    const client = createClient(supabaseUrl, supabaseKey);
    const expiresAt = new Date(
      Date.now() + TREND_CACHE_TTL_HOURS * 60 * 60 * 1000,
    ).toISOString();

    await client.from("trend_cache").upsert(
      {
        query_key: queryKey,
        trend_label: label,
        lifespan_weeks: lifespanWeeks,
        confidence,
        raw_timeline: timeline,
        recent_avg: recentAvg,
        peak_value: peakValue,
        weeks_since_peak: weeksSincePeak,
        fetched_at: new Date().toISOString(),
        expires_at: expiresAt,
        tiktok_signal: tiktokSignal
          ? JSON.parse(JSON.stringify(tiktokSignal))
          : null,
        pinterest_signal: pinterestSignal
          ? JSON.parse(JSON.stringify(pinterestSignal))
          : null,
      },
      { onConflict: "query_key" },
    );
  } catch (err) {
    console.error("Failed to cache trend result:", err);
  }
}

function fitDecayCurve(
  timeline: TimelinePoint[],
): { params: DecayParams; lifespan: TrendLifespan; curveData: CurveDataPoint[] } {
  const values = timeline.map((p) => p.value);
  const n = values.length;

  const sum = values.reduce((a, b) => a + b, 0);
  const historicalAvg = sum / n;

  const recentSlice = values.slice(-4);
  const recentAvg = recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length;

  const peakValue = Math.max(...values);
  const peakIndex = values.lastIndexOf(peakValue);
  const weeksSincePeak = n - 1 - peakIndex;

  const variance =
    values.reduce((acc, v) => acc + (v - historicalAvg) ** 2, 0) / n;
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

  const K = peakValue > 0 ? peakValue : 100;
  const r = trendVelocity > 0 ? clamp(trendVelocity * 2, 0.1, 2.0) : 0.5;
  const t_peak = peakIndex;

  let lambda = 0.1;
  if (weeksSincePeak > 1 && peakValue > 0) {
    const postPeakValues = values.slice(peakIndex);
    if (postPeakValues.length >= 2) {
      const lastVal = postPeakValues[postPeakValues.length - 1];
      const firstVal = postPeakValues[0] || 1;
      const ratio = clamp(lastVal / firstVal, 0.01, 1.0);
      lambda = -Math.log(ratio) / postPeakValues.length;
      lambda = clamp(lambda, 0.02, 0.5);
    }
  }

  const totalSS = values.reduce((acc, v) => acc + (v - historicalAvg) ** 2, 0);
  let residualSS = 0;
  for (let i = 0; i < n; i++) {
    let predicted: number;
    if (i <= peakIndex) {
      predicted = K / (1 + Math.exp(-r * (i - t_peak)));
    } else {
      predicted = K * Math.exp(-lambda * (i - t_peak));
    }
    residualSS += (values[i] - predicted) ** 2;
  }
  const rSquared = totalSS > 0 ? clamp(1 - residualSS / totalSS, 0, 1) : 0.5;

  const params: DecayParams = {
    K,
    r: Math.round(r * 1000) / 1000,
    t_peak,
    lambda: Math.round(lambda * 1000) / 1000,
    r_squared: Math.round(rSquared * 1000) / 1000,
  };

  let label: string;
  let color: string;
  let score: number;
  let weeksRemaining: number;
  let confidence: number;

  if (cv < 0.30 && Math.abs(trendVelocity) < 0.20 && recentAvg > 15) {
    label = "Timeless";
    color = "green";
    score = 100;
    weeksRemaining = 52;
    confidence = clamp(0.70 + (0.30 - cv) * 0.5, 0.55, 0.95);
  } else if (recentAvg < 5 || (peakValue > 20 && recentAvg < peakValue * 0.15)) {
    label = "Dead";
    color = "red";
    score = 0;
    weeksRemaining = 0;
    confidence = clamp(
      0.65 + (1 - recentAvg / Math.max(peakValue, 1)) * 0.25,
      0.55,
      0.92,
    );
  } else if (
    weeksSincePeak > 4 && recentAvg < peakValue * 0.60 && avgSlope < -0.5
  ) {
    label = "Fading";
    color = "orange";
    const currentDeclineRate = Math.abs(avgSlope);
    const remainingInterest = recentAvg - peakValue * 0.15;
    weeksRemaining = currentDeclineRate > 0
      ? Math.round(remainingInterest / currentDeclineRate)
      : 8;
    weeksRemaining = clamp(weeksRemaining, 1, 20);
    score = clamp(Math.round((weeksRemaining / 20) * 50 + 10), 10, 60);
    confidence = clamp(0.60 + Math.abs(trendVelocity) * 0.3, 0.55, 0.90);
  } else if (trendVelocity > 0.20 || (weeksSincePeak <= 4 && recentAvg > peakValue * 0.75)) {
    label = "Trending";
    color = "yellow";
    weeksRemaining = trendVelocity > 0.8 ? 6 : trendVelocity > 0.4 ? 12 : 20;
    score = clamp(Math.round(60 + trendVelocity * 30), 60, 90);
    confidence = clamp(0.60 + Math.abs(trendVelocity) * 0.25, 0.55, 0.90);
  } else {
    label = "Trending";
    color = "yellow";
    weeksRemaining = 14;
    score = 50;
    confidence = 0.50;
  }

  const velocityPerWeek = recentValues.length > 1 ? avgSlope : 0;

  const lifespan: TrendLifespan = {
    label,
    color,
    score,
    peaked_weeks_ago: weeksSincePeak,
    weeks_remaining: weeksRemaining,
    confidence: Math.round(confidence * 100) / 100,
    velocity: Math.round(velocityPerWeek * 100) / 100,
  };

  const curveData: CurveDataPoint[] = [];

  for (let i = 0; i < n; i++) {
    const ts = Number(timeline[i].timestamp);
    const date = new Date(ts * 1000);
    const year = date.getFullYear();
    const weekNum = Math.ceil(
      ((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7,
    );
    curveData.push({
      week: `${year}-W${String(weekNum).padStart(2, "0")}`,
      interest: values[i],
      source: "composite",
    });
  }

  const lastTs = Number(timeline[n - 1].timestamp);
  const weekSeconds = 7 * 24 * 60 * 60;
  for (let w = 1; w <= 16; w++) {
    const futureTs = lastTs + w * weekSeconds;
    const futureDate = new Date(futureTs * 1000);
    const year = futureDate.getFullYear();
    const weekNum = Math.ceil(
      ((futureDate.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) /
        7,
    );

    const projected = Math.max(
      0,
      Math.round(recentAvg * Math.exp(-lambda * w)),
    );

    curveData.push({
      week: `${year}-W${String(weekNum).padStart(2, "0")}`,
      interest: projected,
      source: "projected",
      projected: true,
    });
  }

  return { params, lifespan, curveData };
}

async function saveAnalysis(
  supabaseUrl: string,
  supabaseKey: string,
  queryText: string,
  inputType: string,
  lifespan: TrendLifespan,
  curveData: CurveDataPoint[],
  decayParams: DecayParams,
  timeline: TimelinePoint[],
): Promise<string | null> {
  try {
    const client = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await client
      .from("trend_analyses")
      .insert({
        query_text: queryText,
        input_type: inputType,
        trend_lifespan: lifespan,
        trend_curve: curveData,
        decay_params: decayParams,
        source_data: timeline,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save analysis:", error);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error("Failed to save analysis:", err);
    return null;
  }
}

const DEFAULT_BRAND_RESULT: BrandLookupResult = {
  name: "",
  found: false,
  normalized_score: 0.4,
  good_on_you: null,
  bcorp_certified: null,
  fti_score: null,
};

async function lookupBrandRating(
  brand: string,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<BrandLookupResult> {
  try {
    const client = createClient(supabaseUrl, supabaseKey);
    const brandLower = brand.toLowerCase().trim();
    const { data } = await client
      .from("brand_ratings")
      .select(
        "brand_name, normalized_brand_score, good_on_you, bcorp_certified, fti_score",
      )
      .ilike("brand_name_lower", `%${brandLower}%`)
      .limit(1)
      .maybeSingle();

    if (!data) {
      return { ...DEFAULT_BRAND_RESULT, name: brand };
    }

    return {
      name: typeof data.brand_name === "string" && data.brand_name.trim().length > 0
        ? data.brand_name.trim()
        : brand,
      found: true,
      normalized_score: clamp(
        Number(data.normalized_brand_score ?? DEFAULT_BRAND_RESULT.normalized_score),
        0,
        1,
      ),
      good_on_you: typeof data.good_on_you === "string"
        ? data.good_on_you
        : null,
      bcorp_certified: typeof data.bcorp_certified === "boolean"
        ? data.bcorp_certified
        : null,
      fti_score: typeof data.fti_score === "string"
        ? data.fti_score
        : data.fti_score != null
        ? String(data.fti_score)
        : null,
    };
  } catch {
    return { ...DEFAULT_BRAND_RESULT, name: brand };
  }
}

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
    const query = String(body.query ?? "").trim();
    const inputType = String(body.input_type ?? "text");
    const brandInput =
      typeof body.brand === "string" && body.brand.trim().length > 0
        ? body.brand.trim()
        : null;

    if (!query) {
      return new Response(
        JSON.stringify({ detail: "Query is required" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    const serpApiKey = Deno.env.get("SERP_API_KEY");
    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const googleTrendsProviderConfigured = Boolean(serpApiKey);

    if (!googleTrendsProviderConfigured) {
      console.warn(
        "SerpAPI Google Trends is not configured (SERP_API_KEY missing), using keyword fallback",
      );
      const queryKey = normalizeQueryKey(query);
      const fallback = buildFallbackResponse(query, queryKey, false);
      if (brandInput && supabaseUrl && supabaseKey) {
        fallback.brand_info = await lookupBrandRating(
          brandInput,
          supabaseUrl,
          supabaseKey,
        );
      }
      return new Response(JSON.stringify(fallback), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (!rapidApiKey) {
      console.warn(
        "RAPIDAPI_KEY not configured — TikTok and Pinterest signals skipped",
      );
    }

    const queryKey = normalizeQueryKey(query);
    const trendQueryCandidates = buildTrendQueryCandidates(query);
    let timeline: TimelinePoint[] = [];
    let fromCache = false;

    let tiktokResult: TikTokSignal = {
      available: false,
      hashtag_views: null,
      post_count: null,
      normalized_score: 0,
    };
    let pinterestResult: PinterestSignal = {
      available: false,
      board_count: null,
      total_results: null,
      normalized_score: 0,
    };

    const candidateCacheKeys = uniqQueries([queryKey, ...trendQueryCandidates]);

    if (supabaseUrl && supabaseKey) {
      for (const cacheKey of candidateCacheKeys) {
        const cached = await getCachedTimeline(supabaseUrl, supabaseKey, cacheKey);
        if (cached) {
          console.log(`Trend cache hit for: "${cacheKey}"`);
          timeline = cached.timeline;
          fromCache = true;
          if (cached.meta.tiktok_signal) {
            tiktokResult = cached.meta.tiktok_signal as TikTokSignal;
          }
          if (cached.meta.pinterest_signal) {
            pinterestResult = cached.meta.pinterest_signal as PinterestSignal;
          }
          break;
        }
      }
    }

    if (!fromCache) {
      // Start TikTok/Pinterest signal fetches in parallel with Google Trends
      const tiktokFetchPromise = rapidApiKey
        ? fetchTikTokSignal(query, rapidApiKey)
        : Promise.resolve(tiktokResult);
      const pinterestFetchPromise = rapidApiKey
        ? fetchPinterestSignal(query, rapidApiKey)
        : Promise.resolve(pinterestResult);

      let googleResult: { timeline: TimelinePoint[]; success: boolean } = {
        timeline: [],
        success: false,
      };

      for (const candidate of trendQueryCandidates) {
        console.log(`Trying Google Trends candidate: "${candidate}"`);
        const attempt = await fetchGoogleTrendsTimeline(candidate, {
          apiKey: serpApiKey!,
          date: "today 12-m",
        });
        if (attempt.success && attempt.timeline.length > 0) {
          googleResult = attempt;
          break;
        }
      }

      if (!googleResult.success || googleResult.timeline.length === 0) {
        console.warn(
          `SerpAPI Trends returned no data for "${query}", using keyword fallback`,
        );
        const fallback = buildFallbackResponse(
          query,
          queryKey,
          googleTrendsProviderConfigured,
        );
        if (brandInput && supabaseUrl && supabaseKey) {
          fallback.brand_info = await lookupBrandRating(
            brandInput,
            supabaseUrl,
            supabaseKey,
          );
        }
        return new Response(JSON.stringify(fallback), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      timeline = googleResult.timeline;

      // Await signals now that Google Trends data is confirmed
      [tiktokResult, pinterestResult] = await Promise.all([
        tiktokFetchPromise,
        pinterestFetchPromise,
      ]);
    }

    const { params, lifespan, curveData } = fitDecayCurve(timeline);

    lifespan.confidence = adjustConfidence(
      lifespan.confidence,
      lifespan.label,
      tiktokResult,
      pinterestResult,
    );
    lifespan.confidence = Math.round(lifespan.confidence * 100) / 100;

    const historicalPoints = curveData.filter((p) => !p.projected);
    const peakWeek = historicalPoints.length > params.t_peak
      ? historicalPoints[params.t_peak]?.week ??
        historicalPoints[historicalPoints.length - 1].week
      : historicalPoints[historicalPoints.length - 1].week;

    const deathWeekIndex = curveData.findIndex(
      (p) => p.projected && p.interest < (params.K * 0.15),
    );
    const deathWeek = deathWeekIndex >= 0
      ? curveData[deathWeekIndex].week
      : curveData[curveData.length - 1].week;

    let analysisId: string | null = null;
    if (supabaseUrl && supabaseKey) {
      if (!fromCache) {
        const values = timeline.map((p) => p.value);
        const recentSlice = values.slice(-4);
        const recentAvg =
          recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length;
        const peakValue = Math.max(...values);
        const peakIdx = values.lastIndexOf(peakValue);
        const weeksSincePeak = values.length - 1 - peakIdx;

        await cacheTrendData(
          supabaseUrl,
          supabaseKey,
          queryKey,
          lifespan.label,
          lifespan.weeks_remaining,
          lifespan.confidence,
          timeline,
          recentAvg,
          peakValue,
          weeksSincePeak,
          tiktokResult,
          pinterestResult,
        );
      }

      analysisId = await saveAnalysis(
        supabaseUrl,
        supabaseKey,
        query,
        inputType,
        lifespan,
        curveData,
        params,
        timeline,
      );
    }

    let brandInfo: BrandLookupResult | null = null;
    if (brandInput && supabaseUrl && supabaseKey) {
      brandInfo = await lookupBrandRating(brandInput, supabaseUrl, supabaseKey);
    }

    const now = new Date().toISOString();
    const response = {
      analysis_id: analysisId ?? `temp_${Date.now()}`,
      query_normalized: queryKey,
      trend_lifespan: lifespan,
      trend_curve: {
        data_points: curveData,
        peak_week: peakWeek,
        death_week: deathWeek,
        model_type: "logistic_decay",
        r_squared: params.r_squared,
      },
      decay_params: params,
      data_sources: {
        google_trends: {
          available: true,
          last_updated: now,
          from_cache: fromCache,
        },
        tiktok: {
          available: tiktokResult.available,
          last_updated: now,
          ...(tiktokResult.available
            ? {
              hashtag_views: tiktokResult.hashtag_views,
              post_count: tiktokResult.post_count,
            }
            : {}),
        },
        pinterest: {
          available: pinterestResult.available,
          last_updated: now,
          ...(pinterestResult.available
            ? {
              board_count: pinterestResult.board_count,
              total_results: pinterestResult.total_results,
            }
            : {}),
        },
      },
      shareable_url: analysisId
        ? `${WEB_APP_BASE_URL}/analyze/${analysisId}`
        : null,
      ...(brandInfo ? { brand_info: brandInfo } : {}),
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
