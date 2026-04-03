export interface TimelinePoint {
  timestamp: string;
  value: number;
}

interface BrightDataOptions {
  apiKey: string;
  zone: string;
  timeoutMs?: number;
}

interface BrightDataRequestPayload {
  zone: string;
  url: string;
  format: "raw";
}

const BRIGHTDATA_REQUEST_URL = "https://api.brightdata.com/request";
const BRIGHTDATA_PROGRESS_URL = "https://api.brightdata.com/datasets/v3/progress";
const BRIGHTDATA_SNAPSHOT_URL = "https://api.brightdata.com/datasets/v3/snapshot";
const DEFAULT_TIMEOUT_MS = 70_000;
const DEFAULT_ASYNC_WAIT_MS = 90_000;
const POLL_INTERVAL_MS = 2_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildQueryString(entries: Array<[string, string | number | undefined]>): string {
  const params = new URLSearchParams();

  for (const [key, value] of entries) {
    if (value === undefined || value === "") {
      continue;
    }
    params.append(key, String(value));
  }

  return params.toString();
}

function parseJsonLike(text: string): unknown {
  const normalizedText = text.trim().replace(/^\)\]\}'\s*/, "");
  try {
    return JSON.parse(normalizedText);
  } catch {
    return null;
  }
}

async function pollSnapshotUntilReady(
  snapshotId: string,
  apiKey: string,
  maxWaitMs = DEFAULT_ASYNC_WAIT_MS,
): Promise<boolean> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < maxWaitMs) {
    const progressResponse = await fetch(
      `${BRIGHTDATA_PROGRESS_URL}/${encodeURIComponent(snapshotId)}`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!progressResponse.ok) {
      const errorText = await progressResponse.text();
      console.error(
        "Bright Data snapshot progress failed:",
        progressResponse.status,
        errorText,
      );
      return false;
    }

    const progressPayload = await progressResponse.json().catch(() => null);
    const status = isRecord(progressPayload) && typeof progressPayload.status === "string"
      ? progressPayload.status
      : null;

    if (status === "ready") {
      return true;
    }

    if (status === "failed") {
      console.error("Bright Data snapshot failed:", snapshotId);
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  console.error("Bright Data snapshot timed out while polling:", snapshotId);
  return false;
}

async function downloadSnapshot(
  snapshotId: string,
  apiKey: string,
): Promise<unknown | null> {
  try {
    const response = await fetch(
      `${BRIGHTDATA_SNAPSHOT_URL}/${encodeURIComponent(snapshotId)}?format=json`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bright Data snapshot download failed:", response.status, errorText);
      return null;
    }

    const text = await response.text();
    if (!text.trim()) {
      return null;
    }

    return parseJsonLike(text);
  } catch (error) {
    console.error("Bright Data snapshot download failed:", error);
    return null;
  }
}

async function postBrightDataRequest(
  payload: BrightDataRequestPayload,
  { apiKey, zone, timeoutMs = DEFAULT_TIMEOUT_MS }: BrightDataOptions,
): Promise<unknown | null> {
  try {
    const response = await fetch(BRIGHTDATA_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        zone,
        url: payload.url,
        format: payload.format,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (response.status === 202) {
      const pendingText = await response.text();
      const pendingPayload = parseJsonLike(pendingText);
      const snapshotId = isRecord(pendingPayload) && typeof pendingPayload.snapshot_id === "string"
        ? pendingPayload.snapshot_id
        : null;

      if (!snapshotId) {
        console.error("Bright Data request returned 202 without snapshot_id:", pendingText);
        return null;
      }

      const isReady = await pollSnapshotUntilReady(snapshotId, apiKey);
      if (!isReady) {
        return null;
      }

      return await downloadSnapshot(snapshotId, apiKey);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bright Data request failed:", response.status, errorText);
      return null;
    }

    const text = await response.text();
    if (!text.trim()) {
      return null;
    }

    return parseJsonLike(text);
  } catch (error) {
    console.error("Bright Data request failed:", error);
    return null;
  }
}

export function buildGoogleTrendsUrl(
  query: string,
  options: {
    date?: string;
    geo?: string;
    hl?: string;
    cat?: string | number;
    gprop?: string;
    widgets?: string[];
  } = {},
): string {
  const queryString = buildQueryString([
    ["q", query],
    ["date", options.date ?? "today 12-m"],
    ["geo", options.geo],
    ["hl", options.hl],
    ["cat", options.cat],
    ["gprop", options.gprop],
    ["brd_trends", (options.widgets ?? ["timeseries", "geo_map"]).join(",")],
    ["brd_json", "1"],
  ]);

  return `https://trends.google.com/trends/explore?${queryString}`;
}

export function buildGoogleSearchUrl(
  query: string,
  options: {
    hl?: string;
    gl?: string;
    num?: number;
  } = {},
): string {
  const queryString = buildQueryString([
    ["q", query],
    ["hl", options.hl ?? "en"],
    ["gl", options.gl ?? "us"],
    ["num", options.num ?? 10],
    ["brd_json", "1"],
  ]);

  return `https://www.google.com/search?${queryString}`;
}

function findTimeseriesWidget(payload: unknown): Record<string, unknown> | null {
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nested = findTimeseriesWidget(item);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  if (!isRecord(payload) || !Array.isArray(payload.widgets)) {
    if (isRecord(payload)) {
      for (const value of Object.values(payload)) {
        const nested = findTimeseriesWidget(value);
        if (nested) {
          return nested;
        }
      }
    }
    return null;
  }

  for (const widget of payload.widgets) {
    if (!isRecord(widget)) {
      continue;
    }

    const id = typeof widget.id === "string" ? widget.id : "";
    const title = typeof widget.title === "string" ? widget.title : "";
    if (id === "TIMESERIES" || title.toLowerCase() === "interest over time") {
      return widget;
    }
  }

  return null;
}

export async function fetchGoogleTrendsTimeline(
  query: string,
  options: BrightDataOptions & {
    date?: string;
    geo?: string;
    hl?: string;
    cat?: string | number;
    gprop?: string;
  },
): Promise<{ timeline: TimelinePoint[]; success: boolean }> {
  const payload = await postBrightDataRequest(
    {
      zone: options.zone,
      url: buildGoogleTrendsUrl(query, options),
      format: "raw",
    },
    options,
  );

  if (!payload) {
    console.error("Bright Data Trends returned no payload");
    return { timeline: [], success: false };
  }

  const widget = findTimeseriesWidget(payload);
  const timelineData = widget?.data &&
      isRecord(widget.data) &&
      widget.data.default &&
      isRecord(widget.data.default) &&
      Array.isArray(widget.data.default.timelineData)
    ? widget.data.default.timelineData
    : null;

  if (!timelineData) {
    console.error(
      "Bright Data Trends response missing TIMESERIES widget:",
      JSON.stringify(payload).slice(0, 500),
    );
    return { timeline: [], success: false };
  }

  const timeline = timelineData
    .map((point) => {
      if (!isRecord(point) || typeof point.time !== "string") {
        return null;
      }

      const rawValue = Array.isArray(point.value) ? point.value[0] : point.value;
      const value = typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : 0;

      return {
        timestamp: point.time,
        value,
      };
    })
    .filter((point): point is TimelinePoint => point !== null);

  return {
    timeline,
    success: timeline.length > 0,
  };
}

function findNumericValue(value: unknown, keys: string[], depth = 0): number | null {
  if (depth > 6) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findNumericValue(item, keys, depth + 1);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const key of keys) {
    const direct = value[key];
    if (typeof direct === "number" && Number.isFinite(direct)) {
      return direct;
    }
  }

  for (const nested of Object.values(value)) {
    const result = findNumericValue(nested, keys, depth + 1);
    if (result !== null) {
      return result;
    }
  }

  return null;
}

export async function fetchGoogleSearchResultCount(
  query: string,
  options: BrightDataOptions & {
    hl?: string;
    gl?: string;
    num?: number;
  },
): Promise<{ totalResults: number | null; success: boolean }> {
  const payload = await postBrightDataRequest(
    {
      zone: options.zone,
      url: buildGoogleSearchUrl(query, options),
      format: "raw",
    },
    options,
  );

  if (!payload) {
    return { totalResults: null, success: false };
  }

  const totalResults = findNumericValue(payload, [
    "results_cnt",
    "total_results",
    "results_count",
  ]);

  if (totalResults === null || totalResults <= 0) {
    console.error("Bright Data Search response missing total result count");
    return { totalResults: null, success: false };
  }

  return {
    totalResults,
    success: true,
  };
}
