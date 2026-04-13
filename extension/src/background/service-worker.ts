import { parseFiberComposition, normalizeFiberComposition } from "../lib/fiberParser";
import { UNRAVEL_SCORE_ENDPOINT, UNRAVEL_SCORE_TIMEOUT_MS } from "../config/runtime";
import { ScoreApiError, mapScoreApiResponse } from "../lib/scoreApi";
import { getRetailerConfigByHostname } from "../lib/url";
import type {
  ProductContext,
  RuntimeMessage,
  ScoredProductPayload,
  ScoreErrorCode,
  TabScoreState
} from "../types";

const TAB_STATE_KEY_PREFIX = "unravel:score:tab-state:";
const PRODUCT_CACHE_KEY_PREFIX = "unravel:score:product-cache:";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

interface ProductCacheEntry {
  payload: ScoredProductPayload;
  cachedAt: string;
}

const getTabStateKey = (tabId: number): string => `${TAB_STATE_KEY_PREFIX}${tabId}`;
const getProductCacheKey = (productUrl: string): string =>
  `${PRODUCT_CACHE_KEY_PREFIX}${encodeURIComponent(productUrl)}`;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCacheFresh = (cachedAt: string): boolean => {
  const timestamp = Date.parse(cachedAt);
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= CACHE_TTL_MS;
};

const setBadgeForScore = async (
  tabId: number,
  scoreValue: number,
  grade: string,
  productName?: string
) => {
  let color = "#9e2a2b";
  if (scoreValue >= 75) {
    color = "#136f50";
  } else if (scoreValue >= 50) {
    color = "#c88b2b";
  }

  await chrome.action.setBadgeBackgroundColor({ color, tabId });
  await chrome.action.setBadgeText({ text: grade, tabId });

  const title = productName
    ? `Unravel: ${productName} — Score ${scoreValue}/100 (${grade})`
    : `Unravel: Score ${scoreValue}/100 (${grade})`;
  await chrome.action.setTitle({ title, tabId });
};


const clearBadge = async (tabId: number) => {
  await chrome.action.setBadgeText({ tabId, text: "" });
};


const setBadgeForState = async (tabId: number, state: TabScoreState) => {
  if (state.status === "error" || !state.payload) {
    await clearBadge(tabId);
    return;
  }

  await setBadgeForScore(
    tabId,
    state.payload.score.sustainabilityScore.value,
    state.payload.score.sustainabilityScore.grade
  );
};

const buildHttpError = async (response: Response): Promise<ScoreApiError> => {
  let bodyText = "";
  let parsedBody: unknown;

  try {
    bodyText = await response.text();
    parsedBody = bodyText ? JSON.parse(bodyText) : undefined;
  } catch {
    parsedBody = undefined;
  }

  let message = `Score API responded ${response.status}`;
  if (isObject(parsedBody) && typeof parsedBody.detail === "string" && parsedBody.detail.trim()) {
    message = parsedBody.detail;
  } else if (bodyText.trim().length > 0) {
    message = bodyText;
  }

  const lowerBody = bodyText.toLowerCase();
  const errorCode: ScoreErrorCode =
    lowerBody.includes("source_unavailable") ||
      lowerBody.includes("google_trends") ||
      lowerBody.includes("esg")
      ? "source_unavailable"
      : "http_status";

  return new ScoreApiError(errorCode, message, response.status);
};

const scoreProductRemotely = async (product: ProductContext, manualMode = false) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UNRAVEL_SCORE_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(UNRAVEL_SCORE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        product_url: product.productUrl,
        product_name: product.productName,
        fiber_content: product.fiberContent,
        description_text: product.descriptionText,
        material_excerpt: product.materialExcerpt,
        price: product.price,
        currency: product.currency,
        image_url: product.imageUrl,
        brand: product.brand,
        category: product.category,
        manual_mode: manualMode
      })
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ScoreApiError("timeout", "Score API request timed out");
    }

    throw new ScoreApiError("network", "Could not reach the score API");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw await buildHttpError(response);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ScoreApiError("invalid_contract", "Score API response is not valid JSON");
  }

  return mapScoreApiResponse(payload);
};

const normalizeScoreError = (error: unknown): ScoreApiError => {
  if (error instanceof ScoreApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ScoreApiError("invalid_contract", error.message);
  }

  return new ScoreApiError("invalid_contract", "Unknown score API error");
};

const persistTabState = async (tabId: number, state: TabScoreState) => {
  await chrome.storage.local.set({
    [getTabStateKey(tabId)]: state
  });
};

const getStoredTabState = async (tabId: number): Promise<TabScoreState | undefined> => {
  const result = await chrome.storage.local.get(getTabStateKey(tabId));
  return result[getTabStateKey(tabId)] as TabScoreState | undefined;
};

const persistProductCache = async (productUrl: string, payload: ScoredProductPayload) => {
  const entry: ProductCacheEntry = {
    payload,
    cachedAt: payload.scoredAt
  };

  await chrome.storage.local.set({
    [getProductCacheKey(productUrl)]: entry
  });
};

const getFreshProductCache = async (productUrl: string): Promise<ProductCacheEntry | undefined> => {
  const storageKey = getProductCacheKey(productUrl);
  const result = await chrome.storage.local.get(storageKey);
  const entry = result[storageKey] as ProductCacheEntry | undefined;

  if (!entry?.payload || !entry.cachedAt) {
    return undefined;
  }

  if (!isCacheFresh(entry.cachedAt)) {
    await chrome.storage.local.remove(storageKey);
    return undefined;
  }

  return entry;
};

const scoreProductForTab = async (tabId: number, product: ProductContext, manualMode = false): Promise<TabScoreState> => {
  try {
    const score = await scoreProductRemotely(product, manualMode);
    const payload: ScoredProductPayload = {
      product,
      score,
      scoredAt: new Date().toISOString(),
      manualMode
    };

    const state: TabScoreState = {
      status: "ready",
      payload,
      cachedAt: payload.scoredAt
    };

    await persistProductCache(product.productUrl, payload);
    await persistTabState(tabId, state);
    await setBadgeForState(tabId, state);

    return state;
  } catch (error) {
    const normalized = normalizeScoreError(error);
    const cached = await getFreshProductCache(product.productUrl);

    if (cached) {
      const staleState: TabScoreState = {
        status: "stale",
        payload: cached.payload,
        cachedAt: cached.cachedAt,
        errorCode: normalized.code,
        errorMessage: normalized.message
      };

      await persistTabState(tabId, staleState);
      await setBadgeForState(tabId, staleState);
      return staleState;
    }

    const errorState: TabScoreState = {
      status: "error",
      errorCode: normalized.code,
      errorMessage: normalized.message
    };

    await persistTabState(tabId, errorState);
    await setBadgeForState(tabId, errorState);
    return errorState;
  }
};

const ensureFreshState = async (tabId: number, state: TabScoreState): Promise<TabScoreState> => {
  if (!state.payload || !state.cachedAt) {
    return state;
  }

  if (isCacheFresh(state.cachedAt)) {
    return state;
  }

  return scoreProductForTab(tabId, state.payload.product);
};

const requestProductContextFromTab = async (tabId: number): Promise<ProductContext | null> => {
  try {
    const response = (await chrome.tabs.sendMessage(tabId, {
      type: "UNRAVEL_EXTRACT_PRODUCT_CONTEXT"
    } as RuntimeMessage)) as { ok?: boolean; data?: ProductContext | null };

    if (!response?.ok || !response.data) {
      return null;
    }

    return response.data;
  } catch {
    return null;
  }
};

const buildManualFallbackProduct = (
  seed: NonNullable<Extract<RuntimeMessage, { type: "UNRAVEL_SCORE_MANUAL_FIBERS" }>["seed"]>,
  fiberText: string
): ProductContext => {
  let safeUrl = seed.productUrl;
  let hostname = "manual-entry";

  try {
    const parsed = new URL(seed.productUrl);
    safeUrl = parsed.href;
    hostname = parsed.hostname.toLowerCase();
  } catch {
    safeUrl = "https://manual-entry.invalid/product";
  }

  const retailer = getRetailerConfigByHostname(hostname);

  return {
    productUrl: safeUrl,
    productName: seed.productName || "Manual Product",
    brand: seed.brand ?? retailer?.config.retailer ?? hostname.replace(/^www\./, ""),
    category: seed.category ?? "apparel",
    currency: seed.currency ?? "USD",
    retailerDomain: seed.retailerDomain ?? retailer?.domain ?? hostname,
    descriptionText: "",
    fiberText,
    fiberContent: normalizeFiberComposition(parseFiberComposition(fiberText)),
    price: seed.price,
    imageUrl: undefined
  };
};

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, sender, sendResponse): boolean | void => {
    if (message.type === "UNRAVEL_PRODUCT_DETECTED") {
      const tabId = sender.tab?.id;
      if (typeof tabId !== "number") {
        sendResponse({ ok: false });
        return;
      }

      void (async () => {
        const state = await scoreProductForTab(tabId, message.payload);
        sendResponse({ ok: true, data: state });
      })();

      return true;
    }

    if (message.type === "UNRAVEL_GET_SCORE_FOR_TAB") {
      void (async () => {
        const stored = await getStoredTabState(message.tabId);
        const data = stored ? await ensureFreshState(message.tabId, stored) : null;
        sendResponse({ ok: true, data: data ?? null });
      })();

      return true;
    }

    if (message.type === "UNRAVEL_REFRESH_SCORE_FOR_TAB") {
      void (async () => {
        const existingState = await getStoredTabState(message.tabId);
        const product =
          existingState?.payload?.product ?? (await requestProductContextFromTab(message.tabId));

        if (!product) {
          const errorState: TabScoreState = {
            status: "error",
            errorCode: "invalid_contract",
            errorMessage: "Could not extract product context from this tab."
          };

          await persistTabState(message.tabId, errorState);
          await setBadgeForState(message.tabId, errorState);
          sendResponse({ ok: true, data: errorState });
          return;
        }

        const state = await scoreProductForTab(message.tabId, product);
        sendResponse({ ok: true, data: state });
      })();

      return true;
    }

    if (message.type === "UNRAVEL_SCORE_MANUAL_FIBERS") {
      void (async () => {
        const existing = await getStoredTabState(message.tabId);
        const manualComposition = normalizeFiberComposition(parseFiberComposition(message.fiberText));
        let updatedProduct: ProductContext | null = null;

        if (existing?.payload) {
          updatedProduct = {
            ...existing.payload.product,
            fiberText: message.fiberText,
            fiberContent: manualComposition
          };
        } else if (message.seed) {
          updatedProduct = buildManualFallbackProduct(message.seed, message.fiberText);
          updatedProduct.fiberContent = manualComposition;
        }

        if (!updatedProduct) {
          sendResponse({
            ok: false,
            error: "No extracted product context. Provide manual fallback product details."
          });
          return;
        }

        const state = await scoreProductForTab(message.tabId, updatedProduct, true);
        sendResponse({ ok: true, data: state });
      })();

      return true;
    }
  }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    void clearBadge(tabId);
  }
});
