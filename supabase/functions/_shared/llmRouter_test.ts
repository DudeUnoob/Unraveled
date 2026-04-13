import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { completeStructuredJson } from "./llmRouter.ts";

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

Deno.test("completeStructuredJson falls back from Groq to Gemini", async () => {
  await withEnv(
    {
      GROQ_API_KEY: "test-groq",
      GEMINI_API_KEY: "test-gemini",
      GROQ_MODEL: "llama-3.1-8b-instant",
      GEMINI_MODEL: "gemini-3.1-flash-lite",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      let calls = 0;
      (globalThis as unknown as { fetch: typeof fetch }).fetch = ((
        input: URL | RequestInfo,
      ) => {
        calls += 1;
        const url = String(input);
        if (url.includes("api.groq.com")) {
          return Promise.resolve(new Response("rate limited", { status: 429 }));
        }

        if (url.includes("generativelanguage.googleapis.com")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                candidates: [{ content: { parts: [{ text: "{\"value\":42}" }] } }],
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            ),
          );
        }

        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      }) as typeof fetch;

      try {
        const result = await completeStructuredJson(
          {
            schemaName: "sample",
            systemPrompt: "Return JSON.",
            userPrompt: "Return value",
            jsonSchema: {
              type: "object",
              additionalProperties: false,
              properties: { value: { type: "number" } },
              required: ["value"],
            },
          },
          (raw: unknown) => {
            if (
              typeof raw === "object" &&
              raw !== null &&
              "value" in raw &&
              typeof (raw as { value?: unknown }).value === "number"
            ) {
              return { value: (raw as { value: number }).value };
            }
            return null;
          },
        );

        assertExists(result);
        assertEquals(result.provider, "gemini");
        assertEquals(result.data, { value: 42 });
        assertEquals(calls, 2);
      } finally {
        (globalThis as unknown as { fetch: typeof fetch }).fetch = originalFetch;
      }
    },
  );
});
