import { useEffect, useMemo, useState } from "react";
<<<<<<< Updated upstream
import type { RuntimeMessage, ScoredProductPayload } from "../types";
=======
import { FIBER_DURABILITY_WEARS, FIBER_ALIASES } from "../config/fiberData";
import { getRetailerConfigByHostname } from "../lib/url";
import type { RuntimeMessage, TabScoreState } from "../types";
>>>>>>> Stashed changes

type LoadState = "loading" | "ready" | "empty" | "error";
type ActiveTabContext = {
  url: string;
  title: string;
};

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  });

const gradeColor = (grade: string): string => {
  if (grade === "A" || grade === "B") return "bg-emerald-600";
  if (grade === "C" || grade === "D") return "bg-amber-500";
  return "bg-rose-700";
};

<<<<<<< Updated upstream
=======
const progressBarColor = (grade: string): string => {
  if (grade === "A" || grade === "B") return "bg-unravel-accent";
  if (grade === "C" || grade === "D") return "bg-unravel-warn";
  return "bg-unravel-danger";
};

const gradeCircle = (grade: string): string => {
  if (grade === "A" || grade === "B") return "\uD83D\uDFE2";
  if (grade === "C" || grade === "D") return "\uD83D\uDFE1";
  return "\uD83D\uDD34";
};

const healthIcon = (label: string): string => {
  if (label === "Safe") return "\u2705";
  if (label === "Caution") return "\u26A0\uFE0F";
  return "\uD83D\uDD34";
};

const formatTimestamp = (value: string): string => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(parsed));
};

const resolveDurabilityWears = (fiberName: string): number | null => {
  const lower = fiberName.toLowerCase();

  const directKey = Object.keys(FIBER_DURABILITY_WEARS).find((k) => k === lower);
  if (directKey) return FIBER_DURABILITY_WEARS[directKey];

  for (const [canonical, aliases] of Object.entries(FIBER_ALIASES)) {
    if (aliases.some((a) => a === lower) && canonical in FIBER_DURABILITY_WEARS) {
      return FIBER_DURABILITY_WEARS[canonical];
    }
  }

  return null;
};

>>>>>>> Stashed changes
const App = () => {
  const [tabId, setTabId] = useState<number | null>(null);
  const [activeTabContext, setActiveTabContext] = useState<ActiveTabContext | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [payload, setPayload] = useState<ScoredProductPayload | null>(null);
  const [manualFiberText, setManualFiberText] = useState("");
  const [manualProductName, setManualProductName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualBrand, setManualBrand] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState("");

  const loadCurrentTabScore = async () => {
    setLoadState("loading");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setLoadState("error");
      return;
    }

    setTabId(tab.id);
    setActiveTabContext({
      url: tab.url ?? "",
      title: tab.title ?? "Manual Product"
    });
    setManualProductName(tab.title ?? "Manual Product");

    const message: RuntimeMessage = {
      type: "UNRAVEL_GET_SCORE_FOR_TAB",
      tabId: tab.id
    };

    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        setLoadState("error");
        return;
      }

      if (!response.data) {
        setPayload(null);
        setLoadState("empty");
        return;
      }

      const scorePayload = response.data as ScoredProductPayload;
      setPayload(scorePayload);
      setManualFiberText(scorePayload.product.fiberText || "");
      setManualProductName(scorePayload.product.productName);
      setManualPrice(scorePayload.product.price ? String(scorePayload.product.price) : "");
      setLoadState("ready");
    });
  };

  useEffect(() => {
    void loadCurrentTabScore();
  }, []);

  const scoreWidth = useMemo(() => {
    if (!payload) {
      return "0%";
    }

    return `${Math.max(0, Math.min(100, payload.score.sustainabilityScore.value))}%`;
  }, [payload]);

  const submitManualFiber = () => {
    if (!tabId || !manualFiberText.trim()) {
      return;
    }

    const parsedManualPrice = Number(manualPrice);
    const safeManualPrice = Number.isFinite(parsedManualPrice) ? parsedManualPrice : undefined;

    setManualSubmitting(true);
    setManualError("");

    const message: RuntimeMessage = {
      type: "UNRAVEL_SCORE_MANUAL_FIBERS",
      tabId,
      fiberText: manualFiberText,
      seed: payload
        ? undefined
        : {
            productUrl: activeTabContext?.url ?? "",
            productName: manualProductName || "Manual Product",
            brand: manualBrand || undefined,
            price: safeManualPrice
          }
    };

    chrome.runtime.sendMessage(message, (response) => {
      setManualSubmitting(false);

      if (chrome.runtime.lastError || !response?.ok || !response?.data) {
        setManualError(response?.error ?? "Could not score with manual fiber input.");
        return;
      }

      setPayload(response.data as ScoredProductPayload);
      setLoadState("ready");
    });
  };

<<<<<<< Updated upstream
=======
  const payload = tabScoreState?.payload ?? null;

  const scoreWidth = useMemo(() => {
    if (!payload) {
      return "0%";
    }

    return `${Math.max(0, Math.min(100, payload.score.sustainabilityScore.value))}%`;
  }, [payload]);

  const insightTip = useMemo(() => {
    if (!payload?.product.price) return null;

    const breakdown = payload.score.sustainabilityScore.featureContributions.fiberComposition.breakdown;
    if (breakdown.length === 0) return null;

    const dominant = breakdown.reduce((a, b) => (b.pct > a.pct ? b : a));
    const durabilityWears = resolveDurabilityWears(dominant.fiber);
    if (!durabilityWears) return null;

    const idealCpw = payload.product.price / durabilityWears;

    return {
      fiberName: dominant.fiber,
      wears: durabilityWears,
      cpw: idealCpw
    };
  }, [payload]);

>>>>>>> Stashed changes
  if (loadState === "loading") {
    return <div className="popup-shell">Analyzing this product...</div>;
  }

  if (loadState === "error") {
    return <div className="popup-shell">Could not load product score for this tab.</div>;
  }

  if (!payload) {
<<<<<<< Updated upstream
    return (
      <div className="popup-shell">
        <h1 className="text-lg font-semibold">Unravel</h1>
        <p className="mt-2 text-sm text-slate-700">
          Auto-extraction has not produced a score yet. You can still score manually from the
          visible composition text.
        </p>
=======
    const isUnavailable = tabScoreState?.status === "error";

    let isUnsupportedSite = false;
    try {
      const hostname = new URL(activeTabContext?.url ?? "").hostname.toLowerCase();
      isUnsupportedSite = !getRetailerConfigByHostname(hostname);
    } catch {
      isUnsupportedSite = true;
    }

    let fallbackMessage: string;
    if (isUnavailable) {
      fallbackMessage = "Live Google Trends + ESG scoring is currently unavailable. You can still paste fiber content below to score manually.";
    } else if (isUnsupportedSite) {
      fallbackMessage = "This site isn't supported for auto-extraction yet. Paste the fiber content from the product page below to score any item.";
    } else {
      fallbackMessage = "Auto-extraction didn't find fiber data on this page. You can paste the composition text below to score manually.";
    }

    return (
      <div className="popup-shell">
        <h1 className="text-lg font-semibold">{"\uD83E\uDDF5"} Unravel</h1>

        {isUnsupportedSite ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Supported sites: Zara, H&M, ASOS, Shein, Amazon Fashion. More coming soon.
          </p>
        ) : null}

        <p className="mt-2 text-sm text-slate-700">{fallbackMessage}</p>

        {!isUnsupportedSite ? (
          <button
            type="button"
            className="mt-3 w-full rounded-md border border-slate-400 px-2 py-1.5 text-xs font-semibold"
            disabled={refreshing || manualSubmitting}
            onClick={refreshScore}
          >
            {refreshing ? "Refreshing..." : "Retry live score"}
          </button>
        ) : null}

>>>>>>> Stashed changes
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Product Name
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          value={manualProductName}
          onChange={(event) => setManualProductName(event.target.value)}
        />
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Brand
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          value={manualBrand}
          onChange={(event) => setManualBrand(event.target.value)}
          placeholder="e.g. Zara, H&M, Everlane"
        />
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Price (optional)
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          inputMode="decimal"
          value={manualPrice}
          onChange={(event) => setManualPrice(event.target.value)}
          placeholder="49.90"
        />
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Fiber Content
        </label>
        <textarea
          className="mt-1 h-20 w-full resize-none rounded-md border border-slate-300 px-2 py-2 text-xs"
          value={manualFiberText}
          onChange={(event) => setManualFiberText(event.target.value)}
          placeholder="55% linen, 30% cotton, 15% polyester"
        />
        {manualError ? <p className="mt-1 text-xs text-rose-700">{manualError}</p> : null}
        <button
          type="button"
          onClick={submitManualFiber}
          disabled={manualSubmitting || !manualFiberText.trim()}
          className="mt-2 w-full rounded-md bg-unravel-accent px-2 py-1.5 text-xs font-semibold text-white"
        >
          {manualSubmitting ? "Scoring..." : "Score with manual fiber input"}
        </button>
      </div>
    );
  }

  const priceDisplay = payload.product.price
    ? currencyFormatter(payload.product.currency).format(payload.product.price)
    : "Price unavailable";

<<<<<<< Updated upstream
=======
  const esgSource = payload.score.sustainabilityScore.featureContributions.brandReputation.sources.esgApi;
  const grade = payload.score.sustainabilityScore.grade;

>>>>>>> Stashed changes
  return (
    <main className="popup-shell">
      <header className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-unravel-accent">
          {"\uD83E\uDDF5"} UNRAVEL
        </p>
        <h1 className="line-clamp-2 text-base font-semibold text-unravel-ink">{payload.product.productName}</h1>
        <p className="text-xs text-slate-600">
          {payload.product.brand} · {priceDisplay}
        </p>
      </header>

      <section className="rounded-xl bg-unravel-card p-3 shadow-card">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          Sustainability Score
        </p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-3xl font-bold text-unravel-ink">
            {payload.score.sustainabilityScore.value}
            <span className="ml-1 text-lg">
              / {grade} {gradeCircle(grade)}
            </span>
          </p>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold text-white ${gradeColor(grade)}`}
          >
            Grade {grade}
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-200">
          <div
            className={`h-2 rounded-full ${progressBarColor(grade)}`}
            style={{ width: scoreWidth }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Fiber {payload.score.sustainabilityScore.featureContributions.fiberComposition.featureValue} ·
          Brand {payload.score.sustainabilityScore.featureContributions.brandReputation.featureValue} ·
          Trend {payload.score.sustainabilityScore.featureContributions.microTrendLongevity.featureValue}
        </p>
      </section>

      <section className="mt-3 grid grid-cols-2 gap-2">
        <article className="rounded-xl bg-unravel-card p-3 shadow-card">
          <p className="text-[11px] uppercase tracking-wide text-slate-600">Trend</p>
          <p className="mt-1 text-base font-semibold text-unravel-ink">{payload.score.trendScore.label}</p>
          <p className="text-xs text-slate-600">~{payload.score.trendScore.lifespanWeeks} weeks</p>
        </article>

        <article className="rounded-xl bg-unravel-card p-3 shadow-card">
          <p className="text-[11px] uppercase tracking-wide text-slate-600">Cost / Wear</p>
          <p className="mt-1 text-base font-semibold text-unravel-ink">
            {currencyFormatter(payload.product.currency).format(payload.score.cpwEstimate.costPerWear)}
          </p>
          <p className="text-xs text-slate-600">
            adj {currencyFormatter(payload.product.currency).format(payload.score.cpwEstimate.trendAdjustedCpw)}
          </p>
        </article>
      </section>

      <section className="mt-3 rounded-xl bg-unravel-card p-3 shadow-card">
        <p className="text-[11px] uppercase tracking-wide text-slate-600">Health</p>
        <p className="mt-1 text-base font-semibold text-unravel-ink">
          {healthIcon(payload.score.healthScore.label)} {payload.score.healthScore.label}
        </p>
        {payload.score.healthScore.flags.length > 0 ? (
          <p className="mt-1 text-xs text-slate-600">Flags: {payload.score.healthScore.flags.join(", ")}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-600">No known concern flags detected.</p>
        )}
      </section>

<<<<<<< Updated upstream
=======
      {insightTip ? (
        <section className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-xs text-slate-700">
            {"\uD83D\uDCA1"} A classic {insightTip.fiberName} item lasts ~{insightTip.wears} wears at{" "}
            {currencyFormatter(payload.product.currency).format(insightTip.cpw)}/wear
          </p>
        </section>
      ) : null}

>>>>>>> Stashed changes
      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-unravel-accent px-3 py-2 text-sm font-semibold text-white"
        onClick={() => {
          void chrome.tabs.create({ url: payload.score.webAppDeepLink });
        }}
      >
        {"\uD83D\uDD0D"} See Full Trend Analysis {"\u2192"}
      </button>

      <button
        type="button"
        className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-400"
        disabled
        title="Coming soon in Stage 2"
      >
        {"\uD83D\uDC55"} See Better Alternatives {"\u2192"}
      </button>

      <details className="mt-3">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          Data Sources
        </summary>
        <div className="mt-1 rounded-xl bg-unravel-card p-3 shadow-card">
          <p className="text-xs text-slate-700">
            Trend: Google Trends · Updated {formatTimestamp(payload.score.trendScore.lastUpdated)}
          </p>
          <p className="mt-1 text-xs text-slate-700">
            ESG: {esgSource.provider} · Updated {formatTimestamp(esgSource.lastUpdated)}
          </p>
        </div>
      </details>

      <section className="mt-3 rounded-xl border border-dashed border-slate-300 p-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-600">Manual Fiber Input</p>
        <p className="mt-1 text-xs text-slate-600">
          If extraction is wrong, paste text like: <span className="font-medium">55% linen, 30% cotton, 15% polyester</span>.
        </p>
        <textarea
          className="mt-2 h-20 w-full resize-none rounded-md border border-slate-300 px-2 py-2 text-xs"
          value={manualFiberText}
          onChange={(event) => setManualFiberText(event.target.value)}
        />
        {manualError ? <p className="mt-1 text-xs text-rose-700">{manualError}</p> : null}
        <button
          type="button"
          onClick={submitManualFiber}
          disabled={manualSubmitting}
          className="mt-2 w-full rounded-md border border-slate-400 px-2 py-1.5 text-xs font-semibold"
        >
          {manualSubmitting ? "Scoring..." : "Re-score with manual fiber content"}
        </button>
      </section>

      <footer className="mt-4 flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-500">
        <span>Powered by Unravel</span>
        <button
          type="button"
          className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
          title="Settings — coming soon"
          onClick={() => {
            /* Future: chrome.runtime.openOptionsPage() */
          }}
        >
          Settings {"\u2699\uFE0F"}
        </button>
      </footer>
    </main>
  );
};

export default App;
