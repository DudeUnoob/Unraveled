export interface TimelinePoint {
  timestamp: string;
  value: number;
}

interface SerpApiOptions {
  apiKey: string;
  timeoutMs?: number;
}

const SERPAPI_BASE_URL = "https://serpapi.com/search.json";
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * How many trend query strings to try with SerpAPI Google Trends (one call each).
 * Set to 1 to use only the first candidate (lowest Serp usage).
 */
export const MAX_GOOGLE_TRENDS_CANDIDATE_ATTEMPTS = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Fetch Google Trends TIMESERIES data via SerpAPI.
 *
 * Endpoint: GET https://serpapi.com/search.json?engine=google_trends
 *
 * Returns parsed timeline points with { timestamp, value } matching the
 * same shape that BrightData previously returned so all downstream
 * consumers (fitDecayCurve, analyzeTrendTimeline, etc.) are unaffected.
 */
export async function fetchGoogleTrendsTimeline(
  query: string,
  options: SerpApiOptions & {
    date?: string;
    geo?: string;
    hl?: string;
    cat?: string | number;
  },
): Promise<{ timeline: TimelinePoint[]; success: boolean }> {
  try {
    const params = new URLSearchParams({
      engine: "google_trends",
      q: query,
      data_type: "TIMESERIES",
      date: options.date ?? "today 12-m",
      hl: options.hl ?? "en",
      api_key: options.apiKey,
    });

    if (options.geo) {
      params.set("geo", options.geo);
    }
    if (options.cat !== undefined && options.cat !== "") {
      params.set("cat", String(options.cat));
    }

    const url = `${SERPAPI_BASE_URL}?${params.toString()}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SerpAPI Google Trends request failed:", response.status, errorText);
      return { timeline: [], success: false };
    }

    const payload = await response.json();

    // SerpAPI returns: { interest_over_time: { timeline_data: [...] } }
    const timelineData = payload?.interest_over_time?.timeline_data;

    if (!Array.isArray(timelineData) || timelineData.length === 0) {
      console.error(
        "SerpAPI Google Trends response missing timeline_data:",
        JSON.stringify(payload).slice(0, 500),
      );
      return { timeline: [], success: false };
    }

    const timeline: TimelinePoint[] = [];

    for (const point of timelineData) {
      if (!isRecord(point) || typeof point.timestamp !== "string") {
        continue;
      }

      // SerpAPI returns values as an array of { query, value, extracted_value }
      // For single-query searches there is one entry; we take the first.
      const valuesArray = Array.isArray(point.values) ? point.values : [];
      const firstValue = valuesArray.length > 0 && isRecord(valuesArray[0])
        ? valuesArray[0]
        : null;

      const extractedValue = firstValue
        ? (typeof firstValue.extracted_value === "number"
          ? firstValue.extracted_value
          : Number(firstValue.extracted_value ?? 0))
        : 0;

      const value = Number.isFinite(extractedValue) ? extractedValue : 0;

      timeline.push({
        timestamp: point.timestamp,
        value,
      });
    }

    return {
      timeline,
      success: timeline.length > 0,
    };
  } catch (error) {
    console.error("SerpAPI Google Trends request failed:", error);
    return { timeline: [], success: false };
  }
}
