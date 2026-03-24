import { useEffect, useMemo, useState } from "react";
import type { RuntimeMessage, TabScoreState } from "../types";

type LoadState = "loading" | "ready" | "fatal";
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

const progressBarColor = (grade: string): string => {
  if (grade === "A" || grade === "B") return "bg-emerald-500";
  if (grade === "C" || grade === "D") return "bg-amber-400";
  return "bg-rose-600";
};

const gradeCircle = (grade: string): string => {
  if (grade === "A") return "🟢";
  if (grade === "B") return "🟡";
  if (grade === "C" || grade === "D") return "🟠";
  return "🔴";
};

const healthIcon = (label: string): string => {
  if (label === "Safe") return "✅";
  if (label === "Caution") return "⚠️";
  return "🚫";
};

const FIBER_DURABILITY_WEARS: Record<string, number> = {
  "organic linen": 90,
  linen: 85,
  hemp: 88,
  "organic cotton": 82,
  "tencel/lyocell": 74,
  "recycled wool": 78,
  wool: 75,
  silk: 60,
  cotton: 62,
  "recycled polyester": 56,
  "viscose/rayon": 45,
  "nylon/spandex blend": 38,
  polyester: 34,
  acrylic: 28,
};

const resolveDurabilityWears = (fiber: string): number | null => {
  const canonical = fiber.toLowerCase().trim();
  return FIBER_DURABILITY_WEARS[canonical] ?? null;
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

const App = () => {
  const [tabId, setTabId] = useState<number | null>(null);
  const [activeTabContext, setActiveTabContext] = useState<ActiveTabContext | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [tabScoreState, setTabScoreState] = useState<TabScoreState | null>(null);
  const [manualFiberText, setManualFiberText] = useState("");
  const [manualProductName, setManualProductName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualBrand, setManualBrand] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [manualError, setManualError] = useState("");

  const applyTabState = (state: TabScoreState | null) => {
    setTabScoreState(state);

    if (!state?.payload) {
      return;
    }

    setManualFiberText(state.payload.product.fiberText || "");
    setManualProductName(state.payload.product.productName);
    setManualPrice(state.payload.product.price ? String(state.payload.product.price) : "");
  };

  const loadCurrentTabScore = async () => {
    setLoadState("loading");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setLoadState("fatal");
      return;
    }

    setTabId(tab.id);
    setActiveTabContext({
      url: tab.url ?? "",
      title: tab.title ?? "Manual Product"
    });

    if (!manualProductName) {
      setManualProductName(tab.title ?? "Manual Product");
    }

    const message: RuntimeMessage = {
      type: "UNRAVEL_GET_SCORE_FOR_TAB",
      tabId: tab.id
    };

    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        setLoadState("ready"); // show manual entry even on error
        return;
      }

      applyTabState((response.data as TabScoreState | null) ?? null);
      setLoadState("ready");
    });
  };

  useEffect(() => {
    void loadCurrentTabScore();
  }, []);

  const refreshScore = () => {
    if (!tabId) {
      return;
    }

    setRefreshing(true);
    setManualError("");

    const message: RuntimeMessage = {
      type: "UNRAVEL_REFRESH_SCORE_FOR_TAB",
      tabId
    };

    chrome.runtime.sendMessage(message, (response) => {
      setRefreshing(false);

      if (chrome.runtime.lastError || !response?.ok || !response?.data) {
        setManualError("Could not refresh this product score.");
        return;
      }

      const nextState = response.data as TabScoreState;
      applyTabState(nextState);
      if (nextState.status === "error") {
        setManualError(nextState.errorMessage ?? "Backend score unavailable.");
      }
    });
  };

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
      seed: tabScoreState?.payload
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

      const nextState = response.data as TabScoreState;
      applyTabState(nextState);
      setLoadState("ready");

      if (nextState.status === "error") {
        setManualError(nextState.errorMessage ?? "Backend score unavailable.");
      }
    });
  };

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

  if (loadState === "loading") {
    return (
      <div className="popup-shell flex flex-col items-center justify-center gap-3 py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-unravel-accent" />
        <p className="text-xs text-slate-500">Analyzing this product...</p>
      </div>
    );
  }

  if (loadState === "fatal") {
    return (
      <div className="popup-shell flex flex-col gap-2 py-6">
        <p className="text-sm font-semibold text-unravel-ink">Could not load tab</p>
        <p className="text-xs text-slate-600">Open a supported retailer page, then click the extension icon.</p>
        <button
          type="button"
          className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs font-semibold"
          onClick={() => void loadCurrentTabScore()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!payload) {
    const isUnavailable = tabScoreState?.status === "error" &&
      (tabScoreState.errorCode === "source_unavailable" || tabScoreState.errorCode === "http_status");

    return (
      <div className="popup-shell">
        <h1 className="text-lg font-semibold text-unravel-ink">Unravel</h1>
        <p className="mt-2 text-sm text-slate-700">
          {isUnavailable
            ? "Live Google Trends + ESG scoring is currently unavailable."
            : "Auto-extraction has not produced a score yet. You can still score manually from the visible composition text."}
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-md border border-slate-400 px-2 py-1.5 text-xs font-semibold"
          disabled={refreshing || manualSubmitting}
          onClick={refreshScore}
        >
          {refreshing ? "Refreshing..." : "Retry live score"}
        </button>
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
          className="mt-2 w-full rounded-md bg-unravel-accent px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {manualSubmitting ? "Scoring..." : "Score with manual fiber input"}
        </button>
      </div>
    );
  }

  const grade = payload.score.sustainabilityScore.grade;
  const priceDisplay = payload.product.price
    ? currencyFormatter(payload.product.currency).format(payload.product.price)
    : "Price unavailable";

  const isManualMode = payload.manualMode === true ||
    payload.score.sustainabilityScore.scoringMode === "fiber_only";
  const hasFiberData = payload.score.cpwEstimate.fiberDataAvailable;
  const hasBrandData = payload.score.sustainabilityScore.featureContributions.brandReputation.brandDataAvailable;

  const esgSource = payload.score.sustainabilityScore.featureContributions.brandReputation.sources.esgApi;

  return (
    <main className="popup-shell">
      <header className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-unravel-accent">
          🧵 UNRAVEL
        </p>
        <h1 className="line-clamp-2 text-base font-semibold text-unravel-ink">{payload.product.productName}</h1>
        <p className="text-xs text-slate-600">
          {payload.product.brand} · {priceDisplay}
        </p>
      </header>

      {tabScoreState?.status === "stale" ? (
        <section className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Showing last real score (cached). Data may be stale.
        </section>
      ) : null}

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
          Fiber {payload.score.sustainabilityScore.featureContributions.fiberComposition.featureValue.toFixed(2)}
          {!isManualMode && (
            <> · Brand {payload.score.sustainabilityScore.featureContributions.brandReputation.featureValue.toFixed(2)}</>
          )}
          {" "}· Trend {payload.score.sustainabilityScore.featureContributions.microTrendLongevity.featureValue.toFixed(2)}
          {isManualMode && (
            <span className="ml-1 text-slate-400">(fiber-only mode)</span>
          )}
        </p>
      </section>

      {insightTip ? (
        <section className="mt-3 rounded-xl bg-unravel-card p-3 shadow-card text-xs text-slate-700">
          <span className="font-semibold">{insightTip.fiberName}</span> fiber lasts ~{insightTip.wears} wears.
          Ideal CPW: {currencyFormatter(payload.product.currency).format(insightTip.cpw)}.
        </section>
      ) : null}

      <section className="mt-3 grid grid-cols-2 gap-2">
        <article className="rounded-xl bg-unravel-card p-3 shadow-card">
          <p className="text-[11px] uppercase tracking-wide text-slate-600">Trend</p>
          <p className="mt-1 text-base font-semibold text-unravel-ink">{payload.score.trendScore.label}</p>
          <p className="text-xs text-slate-600">~{payload.score.trendScore.lifespanWeeks} weeks</p>
        </article>

        <article className="rounded-xl bg-unravel-card p-3 shadow-card">
          <p className="text-[11px] uppercase tracking-wide text-slate-600">Cost / Wear</p>
          {hasFiberData ? (
            <>
              <p className="mt-1 text-base font-semibold text-unravel-ink">
                {currencyFormatter(payload.product.currency).format(payload.score.cpwEstimate.costPerWear)}
              </p>
              <p className="text-xs text-slate-600">
                adj {currencyFormatter(payload.product.currency).format(payload.score.cpwEstimate.trendAdjustedCpw)}
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-base font-semibold text-slate-400">N/A</p>
              <p className="text-xs text-slate-500">Fiber data unavailable</p>
            </>
          )}
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

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-unravel-accent px-3 py-2 text-sm font-semibold text-white"
        onClick={() => {
          void chrome.tabs.create({ url: payload.score.webAppDeepLink });
        }}
      >
        🔍 See Full Trend Analysis →
      </button>

      <button
        type="button"
        className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-400"
        disabled
        title="Coming soon in Stage 2"
      >
        👕 See Better Alternatives →
      </button>

      <details className="mt-3">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          Data Sources
        </summary>
        <div className="mt-1 rounded-xl bg-unravel-card p-3 shadow-card">
          <p className="text-xs text-slate-700">
            Trend: Google Trends · Updated {formatTimestamp(payload.score.trendScore.lastUpdated)}
          </p>
          {!isManualMode && hasBrandData && (
            <p className="mt-1 text-xs text-slate-700">
              ESG: {esgSource.provider} · Updated {formatTimestamp(esgSource.lastUpdated)}
            </p>
          )}
          {!isManualMode && !hasBrandData && (
            <p className="mt-1 text-xs text-slate-400">
              ESG: No brand data found — using default score
            </p>
          )}
        </div>
      </details>

      <section className="mt-3 rounded-xl border border-dashed border-slate-300 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-600">Manual Fiber Input</p>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700"
            onClick={refreshScore}
            disabled={refreshing || manualSubmitting}
          >
            {refreshing ? "Refreshing..." : "Retry live score"}
          </button>
        </div>
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
          disabled={manualSubmitting || !manualFiberText.trim()}
          className="mt-2 w-full rounded-md border border-slate-400 px-2 py-1.5 text-xs font-semibold disabled:opacity-50"
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
          Settings ⚙️
        </button>
      </footer>
    </main>
  );
};

export default App;
