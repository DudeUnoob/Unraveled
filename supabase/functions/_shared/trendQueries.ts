import { completeStructuredJson, type LlmProvider } from "./llmRouter.ts";

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

const FASHION_CATEGORIES = new Set([
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
  "shirts",
  "pants",
  "skirts",
  "jackets",
  "coats",
  "apparel",
]);

export interface TrendCandidateResult {
  candidates: string[];
  llmProvider: LlmProvider | null;
}

export function normalizeQueryKey(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, " ");
}

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

function sanitizeTrendCandidate(candidate: unknown): string | null {
  if (typeof candidate !== "string") {
    return null;
  }

  const normalized = normalizeQueryKey(
    candidate.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " "),
  );

  if (!normalized || normalized.length < 2) {
    return null;
  }

  const words = normalized.split(" ");
  if (words.length > 6) {
    return words.slice(0, 6).join(" ");
  }

  return normalized;
}

function parseLlmCandidates(raw: unknown): string[] {
  if (typeof raw !== "object" || raw === null || !("candidates" in raw)) {
    return [];
  }

  const candidates = (raw as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates
    .map(sanitizeTrendCandidate)
    .filter((candidate): candidate is string => Boolean(candidate));
}

export function buildScoreTrendQuerySeed(productName: string, category: string): string {
  const words = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !TREND_QUERY_STOP_WORDS.has(word));

  const queryWords = words.slice(0, 4);
  if (!FASHION_CATEGORIES.has(category.toLowerCase())) {
    queryWords.push("fashion");
  }

  return normalizeQueryKey(queryWords.join(" "));
}

export function buildHeuristicTrendQueryCandidates(query: string): string[] {
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

  const candidates = [
    nounLike.join(" "),
    withoutColors.join(" "),
    base,
  ];

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

  return multiWordCandidates.length > 0
    ? multiWordCandidates
    : uniqueCandidates.slice(0, 1);
}

export async function buildTrendQueryCandidates(
  query: string,
  context: "score" | "trend-analyze",
): Promise<TrendCandidateResult> {
  const heuristicCandidates = buildHeuristicTrendQueryCandidates(query);

  const llmResult = await completeStructuredJson(
    {
      schemaName: "trend_query_candidates",
      systemPrompt:
        "You convert fashion product text into short Google Trends search phrases. " +
        "Return JSON only and keep each phrase 2-4 words unless 1 word is unavoidable.",
      userPrompt:
        `Context: ${context}\n` +
        `Input query: ${query}\n` +
        "Return candidate Google Trends queries for this fashion item/style.",
      jsonSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          candidates: {
            type: "array",
            minItems: 1,
            maxItems: 6,
            items: { type: "string", minLength: 2, maxLength: 80 },
          },
        },
        required: ["candidates"],
      },
      maxTokens: 220,
      temperature: 0.1,
    },
    (raw: unknown) => {
      const parsed = parseLlmCandidates(raw);
      if (!parsed.length) {
        return null;
      }
      return parsed;
    },
  );

  if (!llmResult) {
    return { candidates: heuristicCandidates, llmProvider: null };
  }

  const merged = uniqQueries([...llmResult.data, ...heuristicCandidates]).slice(0, 6);
  return {
    candidates: merged.length > 0 ? merged : heuristicCandidates,
    llmProvider: llmResult.provider,
  };
}
