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

const gradeLabel = (grade: string): string => {
  if (grade === "A") return "A - Excellent";
  if (grade === "B") return "B - Good";
  if (grade === "C") return "C - Average";
  if (grade === "D") return "D - Poor";
  return `${grade} - Low`;
};

const gradeRingColor = (grade: string): string => {
  if (grade === "A" || grade === "B") return "#5f6642";
  if (grade === "C" || grade === "D") return "#c88b2b";
  return "#9e2a2b";
};

const healthIcon = (label: string): string => {
  if (label === "Safe") return "✓";
  if (label === "Caution") return "⚠";
  return "✕";
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
  if (Number.isNaN(parsed)) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(parsed));
};

// SVG Icons
const GlobeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" stroke="#5f6642" strokeWidth="2" fill="none"/>
    <ellipse cx="16" cy="16" rx="6" ry="14" stroke="#5f6642" strokeWidth="1.5" fill="none"/>
    <line x1="2" y1="16" x2="30" y2="16" stroke="#5f6642" strokeWidth="1.5"/>
    <line x1="4" y1="10" x2="28" y2="10" stroke="#5f6642" strokeWidth="1.5"/>
    <line x1="4" y1="22" x2="28" y2="22" stroke="#5f6642" strokeWidth="1.5"/>
  </svg>
);

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.325 2.317a.75.75 0 0 1 1.35 0l.345.89a2.25 2.25 0 0 0 2.797 1.318l.89-.345a.75.75 0 0 1 .955.955l-.345.89a2.25 2.25 0 0 0 1.318 2.797l.89.345a.75.75 0 0 1 0 1.35l-.89.345a2.25 2.25 0 0 0-1.318 2.797l.345.89a.75.75 0 0 1-.955.955l-.89-.345a2.25 2.25 0 0 0-2.797 1.318l-.345.89a.75.75 0 0 1-1.35 0l-.345-.89a2.25 2.25 0 0 0-2.797-1.318l-.89.345a.75.75 0 0 1-.955-.955l.345-.89a2.25 2.25 0 0 0-1.318-2.797l-.89-.345a.75.75 0 0 1 0-1.35l.89-.345a2.25 2.25 0 0 0 1.318-2.797l-.345-.89a.75.75 0 0 1 .955-.955l.89.345a2.25 2.25 0 0 0 2.797-1.318l.345-.89Z" stroke="#6b705c" strokeWidth="1.5" fill="none"/>
    <circle cx="10" cy="10" r="2.5" stroke="#6b705c" strokeWidth="1.5" fill="none"/>
  </svg>
);

const TrendUpIcon = () => (
  <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 8L5 4L8 6L13 1" stroke="#6b705c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 1H13V4" stroke="#6b705c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TagIcon = () => (
  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 5.5h9M10 1l4 4.5-4 4.5" stroke="#6b705c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="4" cy="5.5" r="1" fill="#6b705c"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 10.5L8.5 14L15 7" stroke="#5f6642" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5h12l-1.5 10H5.5L4 5Z" stroke="#6b705c" strokeWidth="1.5" fill="none"/>
    <path d="M7 5V4a3 3 0 0 1 6 0v1" stroke="#6b705c" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="9" width="3" height="6" rx="1" fill="white"/>
    <rect x="6" y="5" width="3" height="10" rx="1" fill="white"/>
    <rect x="11" y="1" width="3" height="14" rx="1" fill="white"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="7" r="3.5" stroke="#6b705c" strokeWidth="1.5" fill="none"/>
    <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#6b705c" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const AlternativesIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="2.5" cy="5" r="2" stroke="#6b705c" strokeWidth="1.2" fill="none"/>
    <circle cx="7.5" cy="5" r="2" stroke="#6b705c" strokeWidth="1.2" fill="none"/>
    <path d="M4.5 5h1" stroke="#6b705c" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 1v5M3 4l2 2 2-2" stroke="#6b705c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 8h8" stroke="#6b705c" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// Decorative button dots row
const ButtonsRow = ({ variant = "blue" }: { variant?: "blue" | "pink" }) => {
  const colors = variant === "blue"
    ? { outer: "#b8c9d9", inner: "#9bb9d0", hole: "#8aaec7" }
    : { outer: "#e8c4c8", inner: "#d4a8ae", hole: "#c89aa0" };

  const sizes = [11, 9, 10, 8, 11, 9, 10, 8, 11, 9, 10, 8, 11];
  return (
    <div className="flex items-center gap-[6px] flex-wrap">
      {sizes.map((size, i) => (
        <svg key={i} width={size * 2} height={size * 2} viewBox={`0 0 ${size * 2} ${size * 2}`}>
          <circle cx={size} cy={size} r={size - 0.5} fill={colors.outer} stroke={colors.inner} strokeWidth="0.5"/>
          <circle cx={size * 0.45} cy={size * 0.45} r={size * 0.18} fill={colors.hole}/>
          <circle cx={size * 1.55} cy={size * 0.45} r={size * 0.18} fill={colors.hole}/>
          <circle cx={size * 0.45} cy={size * 1.55} r={size * 0.18} fill={colors.hole}/>
          <circle cx={size * 1.55} cy={size * 1.55} r={size * 0.18} fill={colors.hole}/>
        </svg>
      ))}
    </div>
  );
};

// Grade ring SVG
const GradeRing = ({ grade, size = 80 }: { grade: string; size?: number }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const scoreMap: Record<string, number> = { A: 95, B: 75, C: 55, D: 35, F: 15 };
  const pct = (scoreMap[grade] ?? 50) / 100;
  const dash = pct * circ;
  const color = gradeRingColor(grade);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e0c8" strokeWidth="6"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-stix font-semibold text-[11px] leading-tight text-center" style={{ color }}>
          {gradeLabel(grade)}
        </span>
      </div>
    </div>
  );
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
  const [showFiberInput, setShowFiberInput] = useState(false);

  const applyTabState = (state: TabScoreState | null) => {
    setTabScoreState(state);
    if (!state?.payload) return;
    setManualFiberText(state.payload.product.fiberText || "");
    setManualProductName(state.payload.product.productName);
    setManualPrice(state.payload.product.price ? String(state.payload.product.price) : "");
  };

  const loadCurrentTabScore = async () => {
    setLoadState("loading");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) { setLoadState("fatal"); return; }

    setTabId(tab.id);
    setActiveTabContext({ url: tab.url ?? "", title: tab.title ?? "Manual Product" });
    if (!manualProductName) setManualProductName(tab.title ?? "Manual Product");

    const message: RuntimeMessage = { type: "UNRAVEL_GET_SCORE_FOR_TAB", tabId: tab.id };
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError || !response?.ok) { setLoadState("ready"); return; }
      applyTabState((response.data as TabScoreState | null) ?? null);
      setLoadState("ready");
    });
  };

  useEffect(() => { void loadCurrentTabScore(); }, []);

  const refreshScore = () => {
    if (!tabId) return;
    setRefreshing(true);
    setManualError("");
    const message: RuntimeMessage = { type: "UNRAVEL_REFRESH_SCORE_FOR_TAB", tabId };
    chrome.runtime.sendMessage(message, (response) => {
      setRefreshing(false);
      if (chrome.runtime.lastError || !response?.ok || !response?.data) {
        setManualError("Could not refresh this product score.");
        return;
      }
      const nextState = response.data as TabScoreState;
      applyTabState(nextState);
      if (nextState.status === "error") setManualError(nextState.errorMessage ?? "Backend score unavailable.");
    });
  };

  const submitManualFiber = () => {
    if (!tabId || !manualFiberText.trim()) return;
    const parsedManualPrice = Number(manualPrice);
    const safeManualPrice = Number.isFinite(parsedManualPrice) ? parsedManualPrice : undefined;
    setManualSubmitting(true);
    setManualError("");

    const message: RuntimeMessage = {
      type: "UNRAVEL_SCORE_MANUAL_FIBERS",
      tabId,
      fiberText: manualFiberText,
      seed: tabScoreState?.payload ? undefined : {
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
      if (nextState.status === "error") setManualError(nextState.errorMessage ?? "Backend score unavailable.");
    });
  };

  const payload = tabScoreState?.payload ?? null;

  useMemo(() => {
    if (!payload) return "0%";
    return `${Math.max(0, Math.min(100, payload.score.sustainabilityScore.value))}%`;
  }, [payload]);

  useMemo(() => {
    if (!payload?.product.price) return null;
    const breakdown = payload.score.sustainabilityScore.featureContributions.fiberComposition.breakdown;
    if (breakdown.length === 0) return null;
    const dominant = breakdown.reduce((a, b) => (b.pct > a.pct ? b : a));
    const durabilityWears = resolveDurabilityWears(dominant.fiber);
    if (!durabilityWears) return null;
    return { fiberName: dominant.fiber, wears: durabilityWears, cpw: payload.product.price / durabilityWears };
  }, [payload]);

  // Loading state
  if (loadState === "loading") {
    return (
      <div className="popup-container flex flex-col items-center justify-center gap-3 py-16 min-h-[400px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d3cdab] border-t-[#5f6642]" />
        <p className="font-stix text-xs text-[#6b705c] tracking-wide">Analyzing this product...</p>
      </div>
    );
  }

  // Fatal state
  if (loadState === "fatal") {
    return (
      <div className="popup-container flex flex-col gap-4 p-6 min-h-[300px]">
        <header className="flex items-center gap-2 border-b border-[rgba(211,205,171,0.3)] pb-4">
          <GlobeIcon />
          <span className="font-stix font-semibold text-[18px] text-[#5f6642] tracking-[1px] uppercase">UNRAVELED</span>
        </header>
        <p className="font-stix font-semibold text-[#373313]">Could not load tab</p>
        <p className="font-stix text-sm text-[#65603c]">Open a supported retailer page, then click the extension icon.</p>
        <button
          type="button"
          className="w-full rounded-full border border-[#d3cdab] px-4 py-3 font-stix font-bold text-xs text-[#6b705c] uppercase tracking-[1px]"
          onClick={() => void loadCurrentTabScore()}
        >
          Retry
        </button>
      </div>
    );
  }

  // No payload — manual entry
  if (!payload) {
    const isUnavailable = tabScoreState?.status === "error" &&
      (tabScoreState.errorCode === "source_unavailable" || tabScoreState.errorCode === "http_status");

    return (
      <div className="popup-container min-h-[500px]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-[rgba(211,205,171,0.3)] bg-[rgba(252,249,238,0.6)]">
          <div className="flex items-center gap-2">
            <GlobeIcon />
            <span className="font-stix font-semibold text-[18px] text-[#5f6642] tracking-[1px] uppercase">UNRAVELED</span>
          </div>
          <GearIcon />
        </header>

        <div className="p-6 flex flex-col gap-4">
          <p className="font-stix text-sm text-[#65603c]">
            {isUnavailable
              ? "Live Google Trends + ESG scoring is currently unavailable."
              : "No score found. Enter fiber content below to score manually."}
          </p>
          <button
            type="button"
            className="w-full rounded-full bg-[#5f6642] py-3 font-stix font-bold text-xs text-[#fcf9ee] uppercase tracking-[1.2px] shadow-stat"
            disabled={refreshing || manualSubmitting}
            onClick={refreshScore}
          >
            {refreshing ? "Refreshing..." : "Retry Live Score"}
          </button>

          <div className="flex flex-col gap-3">
            {[
              { label: "Product Name", value: manualProductName, setter: setManualProductName, placeholder: "" },
              { label: "Brand", value: manualBrand, setter: setManualBrand, placeholder: "e.g. Zara, H&M, Everlane" },
              { label: "Price (optional)", value: manualPrice, setter: setManualPrice, placeholder: "49.90" },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label}>
                <label className="font-epilogue text-[9px] font-bold uppercase tracking-[2px] text-[#65603c]">{label}</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-[#d3cdab] bg-[rgba(252,249,238,0.5)] px-3 py-2 font-stix text-sm text-[#373313] outline-none focus:border-[#5f6642]"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div>
              <label className="font-epilogue text-[9px] font-bold uppercase tracking-[2px] text-[#65603c]">Fiber Content</label>
              <textarea
                className="mt-1 h-20 w-full resize-none rounded-2xl border border-[#d3cdab] bg-[rgba(252,249,238,0.5)] px-3 py-2 font-stix text-xs text-[#373313] outline-none focus:border-[#5f6642]"
                value={manualFiberText}
                onChange={(e) => setManualFiberText(e.target.value)}
                placeholder="55% linen, 30% cotton, 15% polyester"
              />
            </div>
          </div>

          {manualError ? <p className="font-stix text-xs text-rose-700">{manualError}</p> : null}

          <button
            type="button"
            onClick={submitManualFiber}
            disabled={manualSubmitting || !manualFiberText.trim()}
            className="w-full rounded-full bg-[#5f6642] py-3 font-stix font-bold text-xs text-[#fcf9ee] uppercase tracking-[1.2px] shadow-stat disabled:opacity-50"
          >
            {manualSubmitting ? "Scoring..." : "Score with Manual Fiber Input"}
          </button>
        </div>
      </div>
    );
  }

  const grade = payload.score.sustainabilityScore.grade;
  const scoreValue = payload.score.sustainabilityScore.value;
  const priceDisplay = payload.product.price
    ? currencyFormatter(payload.product.currency).format(payload.product.price)
    : "Price unavailable";
  const isManualMode = payload.manualMode === true ||
    payload.score.sustainabilityScore.scoringMode === "fiber_only";
  const hasFiberData = payload.score.cpwEstimate.fiberDataAvailable;
  const hasBrandData = payload.score.sustainabilityScore.featureContributions.brandReputation.brandDataAvailable;
  const esgSource = payload.score.sustainabilityScore.featureContributions.brandReputation.sources.esgApi;
  const trendWeeks = payload.score.trendScore.lifespanWeeks;
  const trendPct = Math.min(100, (trendWeeks / 52) * 100);

  return (
    <div className="popup-container">
      {/* Header */}
      <header
        className="flex items-center justify-between px-3 py-3 border-b border-[rgba(211,205,171,0.3)]"
        style={{ backdropFilter: "blur(6px)", background: "rgba(252,249,238,0.6)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-[38px] h-[38px] flex items-center justify-center">
            <GlobeIcon />
          </div>
          <span className="font-stix font-semibold text-[18px] text-[#5f6642] tracking-[1px] uppercase">UNRAVELED</span>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-[rgba(107,112,92,0.1)]"
          title="Settings"
        >
          <GearIcon />
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-col">
        {/* Product header */}
        <div className="px-7 pt-6 pb-0">
          <p className="font-stix font-bold text-[13px] text-[#6b705c] uppercase tracking-[1.5px] leading-[15px]">
            {payload.product.brand}
          </p>
          <h1 className="font-stix font-bold text-[26px] leading-[32px] text-[#373313] tracking-[-0.5px] mt-0.5">
            {payload.product.productName}
          </h1>
          <p className="font-stix text-[12px] text-[#6b705c] mt-0.5">{priceDisplay}</p>
        </div>

        {/* Stale badge */}
        {tabScoreState?.status === "stale" && (
          <div className="mx-6 mt-3 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-stix text-amber-900">
            Showing cached score — data may be stale.
          </div>
        )}

        {/* Sustainability Score Card */}
        <div className="mx-6 mt-4 relative">
          <div
            className="rounded-[24px] border border-[rgba(107,112,92,0.1)] p-6 flex items-center justify-between shadow-stat"
            style={{ background: "rgba(247,237,184,0.66)" }}
          >
            <div className="flex flex-col gap-1">
              <p className="font-epilogue font-bold text-[10px] uppercase tracking-[2px] text-[#65603c]">
                SUSTAINABILITY SCORE
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-stix font-bold text-[56px] leading-[56px] text-[#5f6642]">
                  {scoreValue}
                </span>
                <span className="font-stix font-bold text-[20px] opacity-60 text-[#65603c]">/100</span>
              </div>
              {!isManualMode && (
                <p className="font-stix text-[10px] text-[#65603c] opacity-70 mt-1">
                  Fiber {payload.score.sustainabilityScore.featureContributions.fiberComposition.featureValue.toFixed(1)}
                  {" · "}Brand {payload.score.sustainabilityScore.featureContributions.brandReputation.featureValue.toFixed(1)}
                  {" · "}Trend {payload.score.sustainabilityScore.featureContributions.microTrendLongevity.featureValue.toFixed(1)}
                </p>
              )}
            </div>
            <GradeRing grade={grade} size={82} />
          </div>
        </div>

        {/* Buttons decorative row */}
        <div className="mt-3 px-3 py-1 overflow-hidden h-[36px] flex items-center">
          <ButtonsRow variant="blue" />
        </div>

        {/* Dual Stats Row */}
        <div className="mx-6 grid grid-cols-2 gap-3 mt-1">
          {/* Trend Velocity Card */}
          <div
            className="rounded-[24px] border border-[rgba(107,112,92,0.1)] p-4 flex flex-col gap-3 shadow-stat"
            style={{ background: "#9bb9d0", transform: "rotate(1deg)" }}
          >
            <div className="flex items-center gap-2">
              <TrendUpIcon />
              <span className="font-stix font-bold text-[9px] uppercase tracking-[0.9px] text-[#6b705c]">
                TREND VELOCITY
              </span>
            </div>
            <div className="flex flex-col">
              <p className="font-stix font-bold text-[14px] text-[#525838] leading-[20px]">
                {payload.score.trendScore.label} ~{trendWeeks}
              </p>
              <p className="font-stix font-bold text-[14px] text-[#525838] leading-[20px]">weeks</p>
            </div>
            {/* Progress bar */}
            <div className="h-1 rounded-full bg-white">
              <div
                className="h-1 rounded-full bg-[#6b705c]"
                style={{ width: `${trendPct}%` }}
              />
            </div>
          </div>

          {/* Cost / Wear Card */}
          <div
            className="rounded-[24px] border border-[rgba(107,112,92,0.1)] p-4 flex flex-col gap-1.5 shadow-stat relative overflow-hidden"
            style={{ background: "#faf8ef", transform: "rotate(-1deg)" }}
          >
            <div
              className="absolute inset-0 rounded-[24px]"
              style={{ background: "rgba(224,189,195,0.93)", zIndex: 0 }}
            />
            <div className="relative z-10 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <TagIcon />
                <span className="font-stix font-bold text-[9px] uppercase tracking-[0.9px] text-[#6b705c]">
                  COST / WEAR
                </span>
              </div>
              {hasFiberData ? (
                <>
                  <p className="font-stix font-bold text-[22px] text-[#525838] leading-[28px]">
                    {currencyFormatter(payload.product.currency).format(payload.score.cpwEstimate.costPerWear)}
                  </p>
                  <p className="font-stix font-semibold text-[10px] text-[#65603c] leading-[12px]">
                    Trend adj: {currencyFormatter(payload.product.currency).format(payload.score.cpwEstimate.trendAdjustedCpw)}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-stix font-bold text-[22px] text-[#525838] leading-[28px]">N/A</p>
                  <p className="font-stix font-semibold text-[10px] text-[#65603c] leading-[10px]">
                    Based on standard product lifecycle
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Buttons decorative row 2 */}
        <div className="mt-2 px-3 py-1 overflow-hidden h-[36px] flex items-center">
          <ButtonsRow variant="pink" />
        </div>

        {/* Health & Safety */}
        <div
          className="mx-6 mt-1 rounded-[24px] border border-[rgba(211,205,171,0.1)] p-4 flex items-center gap-4 shadow-stat"
          style={{ background: "rgba(255,255,255,0.4)" }}
        >
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(107,112,92,0.1)" }}
          >
            <CheckIcon />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-stix font-bold text-[10px] uppercase tracking-[0.5px] text-[#6b705c]">
              HEALTH &amp; SAFETY
            </p>
            <p className="font-stix font-medium text-[13px] text-[#65603c]">
              {healthIcon(payload.score.healthScore.label)}{" "}
              {payload.score.healthScore.flags.length > 0
                ? `Flags: ${payload.score.healthScore.flags.join(", ")}`
                : "Safe: No known concern flags"}
            </p>
          </div>
        </div>

        {/* Action Cluster */}
        <div className="mx-6 mt-4 flex flex-col gap-3 pb-4">
          <button
            type="button"
            className="w-full rounded-full bg-[#5f6642] py-4 font-stix font-bold text-[11px] text-[#fcf9ee] uppercase tracking-[1.2px] shadow-stat"
            onClick={() => void chrome.tabs.create({ url: payload.score.webAppDeepLink })}
          >
            SEE FULL TREND ANALYSIS
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-full border border-[#d3cdab] bg-[rgba(255,255,255,0.3)] py-3 flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
              disabled
              title="Coming soon"
            >
              <AlternativesIcon />
              <span className="font-stix font-bold text-[10px] uppercase tracking-[1px] text-[#6b705c]">ALTERNATIVES</span>
            </button>
            <button
              type="button"
              className="rounded-full border border-[#d3cdab] bg-[rgba(255,255,255,0.3)] py-3 flex items-center justify-center gap-2"
              onClick={() => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  const activeTab = tabs[0];
                  if (typeof activeTab?.id !== "number") return;
                  chrome.tabs.sendMessage(activeTab.id, { type: "UNRAVEL_DOWNLOAD_FIBER_DATA" });
                });
              }}
            >
              <DownloadIcon />
              <span className="font-stix font-bold text-[10px] uppercase tracking-[1px] text-[#6b705c]">FIBER DATA</span>
            </button>
          </div>

          {/* Manual fiber input toggle */}
          {showFiberInput ? (
            <div className="rounded-[20px] border border-dashed border-[#d3cdab] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-epilogue font-bold text-[9px] uppercase tracking-[2px] text-[#65603c]">Manual Fiber Input</p>
                <button
                  type="button"
                  className="text-[10px] font-stix text-[#6b705c] border border-[#d3cdab] rounded-full px-2 py-1"
                  onClick={refreshScore}
                  disabled={refreshing}
                >
                  {refreshing ? "Refreshing..." : "Retry live score"}
                </button>
              </div>
              <textarea
                className="h-16 w-full resize-none rounded-2xl border border-[#d3cdab] bg-[rgba(252,249,238,0.5)] px-3 py-2 font-stix text-xs text-[#373313] outline-none focus:border-[#5f6642]"
                value={manualFiberText}
                onChange={(e) => setManualFiberText(e.target.value)}
                placeholder="55% linen, 30% cotton, 15% polyester"
              />
              {manualError ? <p className="font-stix text-xs text-rose-700">{manualError}</p> : null}
              <button
                type="button"
                onClick={submitManualFiber}
                disabled={manualSubmitting || !manualFiberText.trim()}
                className="w-full rounded-full border border-[#6b705c] py-2.5 font-stix font-bold text-[10px] uppercase tracking-[1px] text-[#6b705c] disabled:opacity-50"
              >
                {manualSubmitting ? "Scoring..." : "Re-score with manual fiber content"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="w-full text-center font-stix text-[11px] text-[#6b705c] underline underline-offset-2"
              onClick={() => setShowFiberInput(true)}
            >
              Override fiber content manually
            </button>
          )}

          {/* Data sources */}
          <details className="mt-1">
            <summary className="cursor-pointer font-epilogue font-bold text-[9px] uppercase tracking-[2px] text-[#65603c]">
              Data Sources
            </summary>
            <div className="mt-2 rounded-2xl border border-[#d3cdab] bg-[rgba(252,249,238,0.5)] p-3 flex flex-col gap-1">
              <p className="font-stix text-[11px] text-[#65603c]">
                Trend: Google Trends · {formatTimestamp(payload.score.trendScore.lastUpdated)}
              </p>
              {!isManualMode && hasBrandData && (
                <p className="font-stix text-[11px] text-[#65603c]">
                  ESG: {esgSource.provider} · {formatTimestamp(esgSource.lastUpdated)}
                </p>
              )}
              {!isManualMode && !hasBrandData && (
                <p className="font-stix text-[11px] text-[#6b705c] opacity-60">
                  ESG: No brand data found — using default
                </p>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className="flex items-center justify-around px-12 py-3 border-t border-[rgba(211,205,171,0.2)] rounded-t-2xl"
        style={{ backdropFilter: "blur(12px)", background: "rgba(252,249,238,0.8)" }}
      >
        <button type="button" className="flex items-center justify-center w-11 h-11">
          <ShoppingBagIcon />
        </button>
        <button
          type="button"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#5c6c47] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
        >
          <BarChartIcon />
        </button>
        <button type="button" className="flex items-center justify-center w-11 h-11">
          <UserIcon />
        </button>
      </div>
    </div>
  );
};

export default App;
