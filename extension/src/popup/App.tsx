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
  if (grade === "A" || grade === "B") {
    return "bg-emerald-600";
  }

  if (grade === "C" || grade === "D") {
    return "bg-amber-500";
  }

  return "bg-rose-700";
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
        setLoadState("fatal");
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

  if (loadState === "loading") {
    return <div className="popup-shell">Analyzing this product...</div>;
  }

  if (loadState === "fatal") {
    return <div className="popup-shell">Could not load product score for this tab.</div>;
  }

  if (!payload) {
    const isUnavailable = tabScoreState?.status === "error";

    return (
      <div className="popup-shell">
        <h1 className="text-lg font-semibold">Unravel</h1>
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
          className="mt-2 w-full rounded-md border border-slate-400 px-2 py-1.5 text-xs font-semibold"
        >
          {manualSubmitting ? "Scoring..." : "Score with manual fiber input"}
        </button>
      </div>
    );
  }

  const priceDisplay = payload.product.price
    ? currencyFormatter(payload.product.currency).format(payload.product.price)
    : "Price unavailable";

  const esgSource = payload.score.sustainabilityScore.featureContributions.brandReputation.sources.esgApi;

  return (
    <main className="popup-shell">
      <header className="mb-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-unravel-accent">Unravel</p>
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
            <span className="ml-1 text-lg">/100</span>
          </p>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold text-white ${gradeColor(
              payload.score.sustainabilityScore.grade
            )}`}
          >
            Grade {payload.score.sustainabilityScore.grade}
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-unravel-accent" style={{ width: scoreWidth }} />
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
        <p className="mt-1 text-base font-semibold text-unravel-ink">{payload.score.healthScore.label}</p>
        {payload.score.healthScore.flags.length > 0 ? (
          <p className="mt-1 text-xs text-slate-600">Flags: {payload.score.healthScore.flags.join(", ")}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-600">No known concern flags detected.</p>
        )}
      </section>

      <section className="mt-3 rounded-xl bg-unravel-card p-3 shadow-card">
        <p className="text-[11px] uppercase tracking-wide text-slate-600">Data Sources</p>
        <p className="mt-1 text-xs text-slate-700">
          Trend: Google Trends · Updated {formatTimestamp(payload.score.trendScore.lastUpdated)}
        </p>
        <p className="mt-1 text-xs text-slate-700">
          ESG: {esgSource.provider} · Updated {formatTimestamp(esgSource.lastUpdated)}
        </p>
      </section>

      <button
        type="button"
        className="mt-3 w-full rounded-lg bg-unravel-accent px-3 py-2 text-sm font-semibold text-white"
        onClick={() => {
          void chrome.tabs.create({ url: payload.score.webAppDeepLink });
        }}
      >
        See Full Trend Analysis
      </button>

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
          className="mt-2 w-full rounded-md border border-slate-400 px-2 py-1.5 text-xs font-semibold"
        >
          {manualSubmitting ? "Scoring..." : "Re-score with manual fiber content"}
        </button>
      </section>
    </main>
  );
};

export default App;
