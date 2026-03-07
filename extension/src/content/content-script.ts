import "./overlay.css";
import { extractProductContext } from "../lib/productExtraction";
import type { RuntimeMessage, ScoredProductPayload, TabScoreState } from "../types";

const SCAN_INTERVAL_MS = 1400;

let lastSignature = "";
let lastHref = window.location.href;

const buildSignature = (value: {
  productUrl: string;
  productName: string;
  fiberContent: Record<string, number>;
}): string => `${value.productUrl}|${value.productName}|${JSON.stringify(value.fiberContent)}`;

const getAnchorElement = (): HTMLElement | null => {
  const candidates = [
    "[itemprop='price']",
    ".a-price",
    "[data-testid='formatted-price']",
    "[data-testid='current-price']",
    "[data-qa='product-price-current']",
    "main h1"
  ];

  for (const selector of candidates) {
    const node = document.querySelector(selector);
    if (node instanceof HTMLElement) {
      return node;
    }
  }

  return null;
};

const removeOverlay = () => {
  const existing = document.getElementById("unravel-extension-badge");
  existing?.remove();
};

const formatCpw = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
};

const renderOverlay = (payload: ScoredProductPayload) => {
  const anchor = getAnchorElement();
  if (!anchor) {
    return;
  }

  removeOverlay();

  const badge = document.createElement("button");
  badge.id = "unravel-extension-badge";
  badge.type = "button";
  badge.setAttribute("data-grade", payload.score.sustainabilityScore.grade);

  badge.innerHTML = [
    `<strong>🧵 Sust: ${payload.score.sustainabilityScore.value}/${payload.score.sustainabilityScore.grade}</strong>`,
    `${formatCpw(payload.score.cpwEstimate.costPerWear, payload.product.currency)}/wear`,
    "Click the Unravel icon for details"
  ].join("<br>");

  const anchorRect = anchor.getBoundingClientRect();
  const top = window.scrollY + anchorRect.bottom + 8;
  const left = window.scrollX + anchorRect.left;
  badge.style.top = `${Math.max(top, 20)}px`;
  badge.style.left = `${Math.max(left, 12)}px`;

  document.body.appendChild(badge);
};

const detectAndScore = () => {
  const context = extractProductContext();
  if (!context) {
    removeOverlay();
    return;
  }

  const signature = buildSignature(context);
  if (signature === lastSignature) {
    return;
  }

  lastSignature = signature;

  const message: RuntimeMessage = {
    type: "UNRAVEL_PRODUCT_DETECTED",
    payload: context
  };

  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError || !response?.ok || !response?.data) {
      removeOverlay();
      return;
    }

    const state = response.data as TabScoreState;
    if (!state.payload || state.status === "error") {
      removeOverlay();
      return;
    }

    renderOverlay(state.payload);
  });
};

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse): boolean | void => {
  if (message.type === "UNRAVEL_EXTRACT_PRODUCT_CONTEXT") {
    const context = extractProductContext();
    sendResponse({ ok: true, data: context ?? null });
    return;
  }
});

const boot = () => {
  detectAndScore();

  const observer = new MutationObserver(() => {
    detectAndScore();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.setInterval(() => {
    if (window.location.href !== lastHref) {
      lastHref = window.location.href;
      lastSignature = "";
      removeOverlay();
      detectAndScore();
      return;
    }

    detectAndScore();
  }, SCAN_INTERVAL_MS);
};

boot();
