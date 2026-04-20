/**
 * Pinterest social signal via RapidAPI only (pinterest-scraper5).
 * SerpAPI must not be used for Pinterest — reserve SerpAPI for Google Trends only.
 */

const PINTEREST_API_BASE = "https://pinterest-scraper5.p.rapidapi.com";
const RAPIDAPI_HOST = "pinterest-scraper5.p.rapidapi.com";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export interface PinterestRapidSignal {
  available: boolean;
  board_count: number | null;
  total_results: number | null;
  normalized_score: number;
}

export async function fetchPinterestRapidSignal(
  query: string,
  rapidApiKey: string,
): Promise<PinterestRapidSignal> {
  try {
    const params = new URLSearchParams({
      entry: query,
    });

    const url = `${PINTEREST_API_BASE}/boards?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": RAPIDAPI_HOST,
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
          JSON.stringify(responseKeys)
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
