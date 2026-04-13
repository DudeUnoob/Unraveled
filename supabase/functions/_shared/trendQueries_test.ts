import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildHeuristicTrendQueryCandidates,
  buildTrendQueryCandidates,
} from "./trendQueries.ts";

const withEnv = async (
  env: Record<string, string | null>,
  run: () => Promise<void>,
) => {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(env)) {
    previous.set(key, Deno.env.get(key));
    if (value === null) {
      Deno.env.delete(key);
    } else {
      Deno.env.set(key, value);
    }
  }

  try {
    await run();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        Deno.env.delete(key);
      } else {
        Deno.env.set(key, value);
      }
    }
  }
};

Deno.test("buildTrendQueryCandidates prepends LLM candidates and dedupes heuristics", async () => {
  await withEnv(
    {
      GROQ_API_KEY: "test-groq",
      GEMINI_API_KEY: null,
    },
    async () => {
      const originalFetch = globalThis.fetch;
      (globalThis as unknown as { fetch: typeof fetch }).fetch = ((
        input: URL | RequestInfo,
      ) => {
        const url = String(input);
        if (!url.includes("api.groq.com")) {
          return Promise.reject(new Error(`Unexpected URL: ${url}`));
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              choices: [{
                message: {
                  content:
                    "{\"candidates\":[\"wide leg cargo pants\",\"baggy cargo pants\"]}",
                },
              }],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      }) as typeof fetch;

      try {
        const result = await buildTrendQueryCandidates(
          "Baggy cargo pants in black",
          "trend-analyze",
        );

        assertEquals(result.llmProvider, "groq");
        assertEquals(result.candidates[0], "wide leg cargo pants");
        assert(result.candidates.includes("baggy cargo pants"));
      } finally {
        (globalThis as unknown as { fetch: typeof fetch }).fetch = originalFetch;
      }
    },
  );
});

Deno.test("buildTrendQueryCandidates falls back to heuristics when no LLM keys exist", async () => {
  await withEnv(
    {
      GROQ_API_KEY: null,
      GEMINI_API_KEY: null,
    },
    async () => {
      const result = await buildTrendQueryCandidates(
        "Baggy cargo pants in black",
        "score",
      );
      const heuristic = buildHeuristicTrendQueryCandidates("Baggy cargo pants in black");

      assertEquals(result.llmProvider, null);
      assertEquals(result.candidates, heuristic);
    },
  );
});
