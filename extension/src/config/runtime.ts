const DEFAULT_API_BASE_URL = "http://localhost:8000";
const DEFAULT_SCORE_TIMEOUT_MS = 8000;

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const parseTimeout = (value: string | undefined): number => {
  if (!value) {
    return DEFAULT_SCORE_TIMEOUT_MS;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_SCORE_TIMEOUT_MS;
  }

  return Math.floor(parsed);
};

const resolveApiBaseUrl = (): string => {
  const candidate = import.meta.env.VITE_UNRAVEL_API_BASE_URL?.trim();
  if (!candidate) {
    return DEFAULT_API_BASE_URL;
  }

  try {
    const parsed = new URL(candidate);
    return trimTrailingSlash(parsed.toString());
  } catch {
    return DEFAULT_API_BASE_URL;
  }
};

export const UNRAVEL_API_BASE_URL = resolveApiBaseUrl();
export const UNRAVEL_SCORE_ENDPOINT = `${UNRAVEL_API_BASE_URL}/api/v1/score`;
export const UNRAVEL_SCORE_TIMEOUT_MS = parseTimeout(import.meta.env.VITE_UNRAVEL_SCORE_TIMEOUT_MS);

