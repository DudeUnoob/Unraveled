import { parseFiberComposition, normalizeFiberComposition } from "../lib/fiberParser";
import { scoreProductLocally } from "../lib/scoring";
import { getRetailerConfigByHostname } from "../lib/url";
import type { ProductContext, RuntimeMessage, ScoredProductPayload } from "../types";

const STORAGE_KEY_PREFIX = "unravel:score:tab:";
const SCORE_ENDPOINT = "http://localhost:8000/api/v1/score";

const getStorageKey = (tabId: number): string => `${STORAGE_KEY_PREFIX}${tabId}`;

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

<<<<<<< Updated upstream
const tryRemoteScore = async (product: ProductContext) => {
  const response = await fetch(SCORE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      product_url: product.productUrl,
      product_name: product.productName,
      fiber_content: product.fiberContent,
      price: product.price,
      currency: product.currency,
      image_url: product.imageUrl,
      brand: product.brand,
      category: product.category
    })
  });
=======
const clearBadge = async (tabId: number) => {
  await chrome.action.setBadgeText({ tabId, text: "" });
  await chrome.action.setTitle({ tabId, title: "Unravel" });
};

const setBadgeForState = async (tabId: number, state: TabScoreState) => {
  if (state.status === "error" || !state.payload) {
    await clearBadge(tabId);
    return;
  }

  await setBadgeForScore(
    tabId,
    state.payload.score.sustainabilityScore.value,
    state.payload.score.sustainabilityScore.grade,
    state.payload.product.productName
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

const scoreProductRemotely = async (product: ProductContext) => {
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
        price: product.price,
        currency: product.currency,
        image_url: product.imageUrl,
        brand: product.brand,
        category: product.category
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
>>>>>>> Stashed changes

  if (!response.ok) {
    throw new Error(`Score API responded ${response.status}`);
  }

  const payload = await response.json();

  // Convert snake_case API fields into extension camelCase shape.
  return {
    sustainabilityScore: {
      value: payload.sustainability_score.value,
      grade: payload.sustainability_score.grade,
      modelVersion: payload.sustainability_score.model_version,
      featureContributions: {
        fiberComposition: {
          featureValue: payload.sustainability_score.feature_contributions.fiber_composition.feature_value,
          modelWeight: payload.sustainability_score.feature_contributions.fiber_composition.model_weight,
          breakdown: payload.sustainability_score.feature_contributions.fiber_composition.breakdown.map(
            (row: { fiber: string; pct: number; rank: number; weighted: number }) => ({
              fiber: row.fiber,
              pct: row.pct,
              rank: row.rank,
              weighted: row.weighted
            })
          )
        },
        brandReputation: {
          featureValue:
            payload.sustainability_score.feature_contributions.brand_reputation.feature_value,
          modelWeight:
            payload.sustainability_score.feature_contributions.brand_reputation.model_weight,
          sources: {
            goodOnYou:
              payload.sustainability_score.feature_contributions.brand_reputation.sources.good_on_you,
            bcorpCertified:
              payload.sustainability_score.feature_contributions.brand_reputation.sources
                .bcorp_certified,
            ftiScore:
              payload.sustainability_score.feature_contributions.brand_reputation.sources.fti_score,
            remakeScore:
              payload.sustainability_score.feature_contributions.brand_reputation.sources.remake_score ??
              "n/a",
            scrapeSignals:
              payload.sustainability_score.feature_contributions.brand_reputation.sources
                .scrape_signals ?? "n/a"
          }
        },
        microTrendLongevity: {
          featureValue:
            payload.sustainability_score.feature_contributions.micro_trend_longevity.feature_value,
          modelWeight:
            payload.sustainability_score.feature_contributions.micro_trend_longevity.model_weight,
          trendLabel:
            payload.sustainability_score.feature_contributions.micro_trend_longevity.trend_label
        }
      }
    },
    trendScore: {
      label: payload.trend_score.label,
      lifespanWeeks: payload.trend_score.lifespan_weeks,
      confidence: payload.trend_score.confidence
    },
    healthScore: {
      label: payload.health_score.label,
      flags: payload.health_score.flags
    },
    cpwEstimate: {
      estimatedWears: payload.cpw_estimate.estimated_wears,
      costPerWear: payload.cpw_estimate.cost_per_wear,
      trendAdjustedWears: payload.cpw_estimate.trend_adjusted_wears,
      trendAdjustedCpw: payload.cpw_estimate.trend_adjusted_cpw
    },
    webAppDeepLink: payload.web_app_deep_link
  };
};

const scoreProduct = async (product: ProductContext) => {
  try {
    return await tryRemoteScore(product);
  } catch {
    return scoreProductLocally(product);
  }
};

const persistScore = async (tabId: number, payload: ScoredProductPayload) => {
  await chrome.storage.local.set({
    [getStorageKey(tabId)]: payload
  });
};

const getStoredScore = async (tabId: number): Promise<ScoredProductPayload | undefined> => {
  const result = await chrome.storage.local.get(getStorageKey(tabId));
  return result[getStorageKey(tabId)] as ScoredProductPayload | undefined;
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
        const score = await scoreProduct(message.payload);
        const payload: ScoredProductPayload = {
          product: message.payload,
          score,
          scoredAt: new Date().toISOString()
        };

        await persistScore(tabId, payload);
        await setBadgeForScore(tabId, score.sustainabilityScore.value, score.sustainabilityScore.grade);
        sendResponse({ ok: true, data: payload });
      })();

      return true;
    }

    if (message.type === "UNRAVEL_GET_SCORE_FOR_TAB") {
      void (async () => {
        const data = await getStoredScore(message.tabId);
        sendResponse({ ok: true, data: data ?? null });
      })();

      return true;
    }

    if (message.type === "UNRAVEL_SCORE_MANUAL_FIBERS") {
      void (async () => {
        const existing = await getStoredScore(message.tabId);
        const manualComposition = normalizeFiberComposition(parseFiberComposition(message.fiberText));
        let updatedProduct: ProductContext | null = null;

        if (existing) {
          updatedProduct = {
            ...existing.product,
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

        const score = await scoreProduct(updatedProduct);
        const payload: ScoredProductPayload = {
          product: updatedProduct,
          score,
          scoredAt: new Date().toISOString()
        };

        await persistScore(message.tabId, payload);
        await setBadgeForScore(
          message.tabId,
          score.sustainabilityScore.value,
          score.sustainabilityScore.grade
        );

        sendResponse({ ok: true, data: payload });
      })();

      return true;
    }
  }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    void chrome.action.setBadgeText({ tabId, text: "" });
  }
});
