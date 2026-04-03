import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MICRO_TREND_KEYWORDS = [
  "limited",
  "collab",
  "drop",
  "capsule",
  " x ",
  "season",
];

function normalizeBrand(source: string): string {
  return source
    .toLowerCase()
    .replace(/\b(inc\.?|llc\.?|ltd\.?|co\.?|corp\.?)\b/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePriceString(price: string | undefined): number {
  if (!price) return 0;
  const num = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

function computeFiberScore(title: string, brandScore: number): number {
  const t = title.toLowerCase();
  let score = brandScore * 65;

  if (/organic (cotton|wool|linen|hemp)/.test(t)) score += 12;
  else if (/recycled (polyester|nylon)/.test(t)) score += 10;
  else if (/tencel|lyocell|modal/.test(t)) score += 8;
  else if (/cashmere|merino/.test(t)) score += 7;

  if (/(?<!recycled )polyester/.test(t)) score -= 8;

  return Math.max(40, Math.min(98, Math.round(score)));
}

function getSustainabilityGrade(score: number): "A" | "B" | "C" | "D" {
  if (score >= 0.80) return "A";
  if (score >= 0.65) return "B";
  if (score >= 0.50) return "C";
  return "D";
}

function extractStyleTags(title: string): string[] {
  const tags: string[] = [];
  const t = title.toLowerCase();
  const keywords = [
    "organic",
    "recycled",
    "sustainable",
    "classic",
    "wide leg",
    "slim",
    "linen",
    "cotton",
    "wool",
    "tencel",
    "merino",
    "cashmere",
    "vegan",
    "ethical",
    "fair trade",
  ];
  for (const kw of keywords) {
    if (t.includes(kw)) tags.push(kw);
  }
  return tags;
}

function inferCategory(query: string): string {
  const q = query.toLowerCase();
  if (/shoe|sneaker|boot|flat|heel|loafer|sandal/.test(q)) return "footwear";
  if (/bag|tote|purse|backpack/.test(q)) return "accessories";
  if (/jean|pant|trouser|short/.test(q)) return "bottoms";
  if (/dress|skirt/.test(q)) return "dresses";
  if (/jacket|coat|outerwear/.test(q)) return "outerwear";
  return "tops";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, trend_label, limit = 5 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const serpApiKey = Deno.env.get("SERP_API_KEY");
    if (!serpApiKey) {
      return new Response(
        JSON.stringify({
          alternatives: [],
          total: 0,
          error: "SERP_API_KEY not configured",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const trendLabelLower = (trend_label ?? "").toLowerCase();
    const isFadingOrDead = trendLabelLower === "dead" ||
      trendLabelLower === "fading";
    const searchSuffix = isFadingOrDead
      ? "sustainable organic alternative timeless"
      : "sustainable organic ethical";
    const serpQuery = `${query} ${searchSuffix}`;

    const serpUrl = new URL("https://serpapi.com/search.json");
    serpUrl.searchParams.set("engine", "google_shopping");
    serpUrl.searchParams.set("q", serpQuery);
    serpUrl.searchParams.set("gl", "us");
    serpUrl.searchParams.set("hl", "en");
    serpUrl.searchParams.set("num", "20");
    serpUrl.searchParams.set("api_key", serpApiKey);

    const serpRes = await fetch(serpUrl.toString());
    if (!serpRes.ok) {
      console.error("SerpAPI error:", serpRes.status, await serpRes.text());
      return new Response(
        JSON.stringify({ alternatives: [], total: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const serpData = await serpRes.json();
    const shoppingResults: Array<Record<string, unknown>> =
      serpData.shopping_results ?? [];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: brandRows } = await supabase
      .from("brand_ratings")
      .select(
        "brand_name, brand_name_lower, normalized_brand_score, bcorp_certified, good_on_you",
      );

    type BrandData = {
      brand_name: string;
      normalized_brand_score: number;
      bcorp_certified: boolean;
      good_on_you: string;
    };

    const brandLookup = new Map<string, BrandData>();
    for (const row of brandRows ?? []) {
      brandLookup.set(row.brand_name_lower ?? row.brand_name.toLowerCase(), {
        brand_name: row.brand_name,
        normalized_brand_score: row.normalized_brand_score,
        bcorp_certified: row.bcorp_certified,
        good_on_you: row.good_on_you,
      });
    }

    function matchBrand(source: string): BrandData | null {
      const normalized = normalizeBrand(source);
      if (brandLookup.has(normalized)) return brandLookup.get(normalized)!;
      for (const [key, data] of brandLookup) {
        if (key.startsWith(normalized) || normalized.startsWith(key)) {
          return data;
        }
      }
      return null;
    }

    const seen = new Set<string>();
    const alternatives: Array<Record<string, unknown>> = [];
    const category = inferCategory(query);

    for (const result of shoppingResults) {
      if (alternatives.length >= limit * 3) break;

      const source = String(result.source ?? "");
      const title = String(result.title ?? "");
      const productUrl = String(result.link ?? result.product_link ?? "");
      const thumbnail = String(result.thumbnail ?? "");

      if (!productUrl || seen.has(productUrl)) continue;
      seen.add(productUrl);

      const brand = matchBrand(source);
      if (!brand) continue;
      if (brand.normalized_brand_score < 0.50) continue;

      const fiberScore = computeFiberScore(title, brand.normalized_brand_score);
      const grade = getSustainabilityGrade(brand.normalized_brand_score);
      const price = parsePriceString(String(result.price ?? ""));
      const titleLower = title.toLowerCase();
      const isTimeless =
        brand.normalized_brand_score >= 0.70 &&
        !MICRO_TREND_KEYWORDS.some((kw) => titleLower.includes(kw));

      const relevanceScore = fiberScore +
        brand.normalized_brand_score * 20 +
        (isTimeless && isFadingOrDead ? 15 : 0);

      alternatives.push({
        id: `serp-${result.position ?? alternatives.length}`,
        name: title,
        brand: brand.brand_name,
        category,
        price,
        currency: "USD",
        fiber_content: {},
        fiber_score: fiberScore,
        sustainability_grade: grade,
        sustainability_score: Math.round(brand.normalized_brand_score * 100),
        is_timeless: isTimeless,
        image_url: thumbnail,
        product_url: productUrl,
        relevance_score: relevanceScore,
        style_tags: extractStyleTags(title),
      });
    }

    alternatives.sort((a, b) =>
      Number(b.relevance_score) - Number(a.relevance_score)
    );
    const top = alternatives.slice(0, limit);

    return new Response(
      JSON.stringify({ alternatives: top, total: top.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("alternatives error:", err);
    return new Response(
      JSON.stringify({ alternatives: [], total: 0, error: String(err) }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
