export type LlmProvider = "groq" | "gemini";

interface StructuredJsonRequest {
  systemPrompt: string;
  userPrompt: string;
  jsonSchema: Record<string, unknown>;
  schemaName: string;
  temperature?: number;
  maxTokens?: number;
  groqTimeoutMs?: number;
  geminiTimeoutMs?: number;
}

interface StructuredJsonResult<T> {
  provider: LlmProvider;
  data: T;
}

const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";
const DEFAULT_GROQ_TIMEOUT_MS = 2_500;
const DEFAULT_GEMINI_TIMEOUT_MS = 4_000;

const trimForLog = (value: string, maxChars = 400): string =>
  value.length <= maxChars ? value : `${value.slice(0, maxChars)}...`;

const parseJsonPayload = (raw: unknown): unknown | null => {
  if (raw && typeof raw === "object") {
    return raw;
  }

  if (typeof raw !== "string") {
    return null;
  }

  const sanitized = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (!sanitized) {
    return null;
  }

  try {
    return JSON.parse(sanitized);
  } catch {
    return null;
  }
};

const readTextPart = (part: unknown): string => {
  if (typeof part !== "object" || part === null || !("text" in part)) {
    return "";
  }

  const maybeText = (part as { text?: unknown }).text;
  return typeof maybeText === "string" ? maybeText : "";
};

const callGroqStructuredJson = async (
  apiKey: string,
  request: StructuredJsonRequest,
): Promise<unknown | null> => {
  const model = Deno.env.get("GROQ_MODEL") ?? DEFAULT_GROQ_MODEL;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(request.groqTimeoutMs ?? DEFAULT_GROQ_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      temperature: request.temperature ?? 0.1,
      max_completion_tokens: request.maxTokens ?? 400,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: request.schemaName,
          schema: request.jsonSchema,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(
      `Groq structured output failed (${response.status}): ${trimForLog(errorText)}`,
    );
    return null;
  }

  const payload = await response.json().catch(() => null);
  const message = payload?.choices?.[0]?.message;
  if (!message) {
    return null;
  }

  if (message.parsed) {
    return message.parsed;
  }

  if (typeof message.content === "string") {
    return parseJsonPayload(message.content);
  }

  if (Array.isArray(message.content)) {
    const rawText = message.content
      .map((part: unknown) => readTextPart(part))
      .join("\n")
      .trim();
    return parseJsonPayload(rawText);
  }

  return null;
};

const callGeminiStructuredJson = async (
  apiKey: string,
  request: StructuredJsonRequest,
): Promise<unknown | null> => {
  const model = Deno.env.get("GEMINI_MODEL") ?? DEFAULT_GEMINI_MODEL;
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${
      encodeURIComponent(apiKey)
    }`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(request.geminiTimeoutMs ?? DEFAULT_GEMINI_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: request.systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: request.userPrompt }],
        },
      ],
      generationConfig: {
        temperature: request.temperature ?? 0.1,
        maxOutputTokens: request.maxTokens ?? 400,
        responseMimeType: "application/json",
        responseSchema: request.jsonSchema,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(
      `Gemini structured output failed (${response.status}): ${trimForLog(errorText)}`,
    );
    return null;
  }

  const payload = await response.json().catch(() => null);
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return null;
  }

  const rawText = parts
    .map((part: unknown) => readTextPart(part))
    .join("\n")
    .trim();

  return parseJsonPayload(rawText);
};

export async function completeStructuredJson<T>(
  request: StructuredJsonRequest,
  parse: (raw: unknown) => T | null,
): Promise<StructuredJsonResult<T> | null> {
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

  if (groqApiKey) {
    try {
      const groqRaw = await callGroqStructuredJson(groqApiKey, request);
      const groqParsed = parse(groqRaw);
      if (groqParsed) {
        return { provider: "groq", data: groqParsed };
      }
    } catch (error) {
      console.warn("Groq call failed; trying Gemini fallback:", error);
    }
  }

  if (geminiApiKey) {
    try {
      const geminiRaw = await callGeminiStructuredJson(geminiApiKey, request);
      const geminiParsed = parse(geminiRaw);
      if (geminiParsed) {
        return { provider: "gemini", data: geminiParsed };
      }
    } catch (error) {
      console.warn("Gemini fallback failed:", error);
    }
  }

  return null;
}
