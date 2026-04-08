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

const saveFiberDataToStorage = (fiberData: any) => {
  // Get existing fiber data from storage
  chrome.storage.local.get(['unravelFiberData'], (result) => {
    const existingData = (result.unravelFiberData as any[]) || [];
    const updatedData = [...existingData, fiberData];

    // Keep only last 100 entries to prevent storage bloat
    if (updatedData.length > 100) {
      updatedData.splice(0, updatedData.length - 100);
    }

    // Save updated data
    chrome.storage.local.set({ unravelFiberData: updatedData }, () => {
      if (chrome.runtime.lastError) {
        console.log('[UNRAVEL] Error saving fiber data:', chrome.runtime.lastError);
      } else {
        console.log('[UNRAVEL] ✅ Fiber data saved to storage (', updatedData.length, 'entries)');
      }
    });
  });
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
    console.log('[UNRAVEL] No product context found');
    return;
  }

  const signature = buildSignature(context);
  if (signature === lastSignature) {
    return;
  }

  lastSignature = signature;

  // Output fiber data as JSON for easy extraction
  const fiberData = {
    productUrl: context.productUrl,
    productName: context.productName,
    brand: context.brand,
    retailer: context.retailerDomain,
    fiberContent: context.fiberContent,
    rawFiberText: context.fiberText,
    extractedAt: new Date().toISOString()
  };

  console.log('[UNRAVEL] FIBER DATA JSON:', JSON.stringify(fiberData, null, 2));

  // Save to local storage for persistence
  saveFiberDataToStorage(fiberData);

  const message: RuntimeMessage = {
    type: "UNRAVEL_PRODUCT_DETECTED",
    payload: context
  };

  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError || !response?.ok || !response?.data) {
      console.log('[UNRAVEL] Scoring failed, but fiber data extracted');
      return;
    }

    const state = response.data as TabScoreState;
    if (!state.payload || state.status === "error") {
      console.log('[UNRAVEL] Scoring error, but fiber data available');
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

  if (message.type === "UNRAVEL_DOWNLOAD_FIBER_DATA") {
    chrome.storage.local.get(['unravelFiberData'], (result) => {
      const fiberData = (result.unravelFiberData as any[]) || [];
      const dataStr = JSON.stringify(fiberData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unravel-fiber-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      sendResponse({ ok: true, count: fiberData.length });
    });
    return true; // Keep message channel open for async response
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
