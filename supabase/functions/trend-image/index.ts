import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    return new Response(JSON.stringify({ detail: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const imageUrl = String(body.image_url ?? "").trim();

    if (!imageUrl) {
      return new Response(JSON.stringify({ detail: "image_url is required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    try {
      const parsed = new URL(imageUrl);
      if (!parsed.hostname.endsWith(".supabase.co")) {
        return new Response(
          JSON.stringify({ detail: "Only Supabase Storage URLs are accepted" }),
          {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          },
        );
      }
    } catch {
      return new Response(JSON.stringify({ detail: "Invalid image URL" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ detail: "Image analysis unavailable" }),
        {
          status: 503,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    const systemPrompt =
      `You are a fashion trend analyst with deep knowledge of current and historical fashion trends, silhouettes, and style movements.

Analyze the clothing item in this image and return structured JSON.

BRAND DETECTION:
- Only return a brand name if you can clearly see a logo, brand tag, distinctive branded pattern (e.g. Burberry check, Louis Vuitton monogram), or other unmistakable brand identifier in the image.
- If the brand is not visible, unclear, or you are not confident, return null for brand.
- NEVER guess or fabricate a brand. When in doubt, return null.

STYLE QUERY (suggested_query):
- Generate a specific, trend-searchable query (2-6 words) that captures the ACTUAL style trend this item belongs to.
- This query will be used for Google Trends and TikTok searches, so it must match real fashion search terms people actually use.
- Prefer the most specific silhouette or fashion movement visible in the image over generic garment names.
- If the image only supports a single strong fashion noun (for example "jorts"), return that noun instead of padding with vague adjectives.
- Good examples: "barrel leg jeans", "mesh ballet flats", "mob wife fur coat", "oversized moto jacket", "sheer mesh top", "boxy cropped blazer", "wide leg cargo pants", "coquette bow top", "quiet luxury trousers".
- BAD examples (too generic): "trendy hoodies", "nice jeans", "blue shirt", "casual top", "stylish dress", "cool jacket".
- Focus on the specific silhouette, fabric treatment, style movement, or fashion subculture this item represents.
- The query should describe the style/trend, NOT the brand. Even if you identify a brand, the query should be style-focused.

KEYWORDS:
- Return 3-6 specific style attribute keywords (e.g. "distressed", "oversized", "cropped", "pleated", "sheer", "ribbed", "high-waisted").
- Avoid generic words like "fashionable", "trendy", "stylish", "nice".

Return ONLY valid JSON with these exact keys:
{
  "description": "one concise sentence describing the item's style",
  "category": "one of: tops, bottoms, dresses, outerwear, footwear, accessories",
  "brand": "brand name if clearly visible, or null",
  "keywords": ["3-6 specific style attribute keywords"],
  "suggested_query": "specific trend/style search query (2-6 words)"
}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "high" },
              },
              {
                type: "text",
                text:
                  "Analyze this clothing item. Identify the brand if visible. Return JSON only.",
              },
            ],
          },
        ],
        max_tokens: 400,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI error:", openaiRes.status, errText);
      return new Response(
        JSON.stringify({ detail: "Image analysis failed" }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content ?? "";

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse OpenAI JSON:", content);
      return new Response(
        JSON.stringify({ detail: "Failed to parse image analysis" }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    const validCategories = [
      "tops",
      "bottoms",
      "dresses",
      "outerwear",
      "footwear",
      "accessories",
    ];
    const category = validCategories.includes(parsed.category)
      ? parsed.category
      : "tops";

    const rawBrand = parsed.brand;
    const brand =
      (typeof rawBrand === "string" && rawBrand.trim().length > 0 &&
          rawBrand.toLowerCase() !== "null")
        ? rawBrand.trim()
        : null;

    const result = {
      style_description: String(parsed.description ?? ""),
      category,
      brand,
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.map(String).filter((kw: string) => kw.length > 0)
        : [],
      suggested_query: String(parsed.suggested_query ?? parsed.description ?? "")
        .slice(0, 100),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("trend-image error:", message);
    return new Response(JSON.stringify({ detail: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
