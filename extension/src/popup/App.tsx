import { useEffect, useMemo, useState } from "react";
import { isCpwPriceAvailable } from "../lib/cpwUi";
import { mapScoreApiResponse } from "../lib/scoreApi";
import { writePriceOverride } from "../lib/priceOverrides";
import type { RuntimeMessage, ScoredProductPayload, TabScoreState } from "../types";

import logoUrl from "./assets/logo.png";
import buttonsUrl from "./assets/buttons.png";
import fabricUrl from "./assets/fabric.png";

/** Vite preview / design mode — full API-shaped payload mapped through the real parser */
const PREVIEW_RAW = {
  sustainability_score: {
    value: 69,
    grade: "C",
    model_version: "v1.3-llm-inputs",
    scoring_mode: "full",
    feature_contributions: {
      fiber_composition: {
        feature_value: 0.62,
        model_weight: 0.5,
        breakdown: [
          { fiber: "cotton", pct: 60, rank: 0.65, weighted: 39 },
          { fiber: "polyester", pct: 40, rank: 0.34, weighted: 13.6 }
        ]
      },
      brand_reputation: {
        feature_value: 0.55,
        model_weight: 0.3,
        brand_data_available: true,
        sources: {
          good_on_you: "3/5",
          bcorp_certified: false,
          fti_score: "40%",
          remake_score: "n/a",
          scrape_signals: "n/a",
          esg_api: {
            provider: "preview",
            score: 0.55,
            last_updated: "2026-01-15T12:00:00Z",
            available: true
          }
        }
      },
      micro_trend_longevity: {
        feature_value: 0.72,
        model_weight: 0.2,
        trend_label: "Trending"
      }
    }
  },
  trend_score: {
    label: "Trending",
    lifespan_weeks: 14,
    confidence: 0.7,
    source: "google_trends",
    last_updated: "2026-01-15T12:00:00Z"
  },
  health_score: {
    label: "Safe",
    flags: []
  },
  cpw_estimate: {
    estimated_wears: 48,
    cost_per_wear: 2.08,
    trend_adjusted_wears: 35,
    trend_adjusted_cpw: 2.86,
    fiber_data_available: true,
    price_available: true
  },
  data_sources: {
    google_trends: {
      available: true,
      last_updated: "2026-01-15T12:00:00Z"
    },
    esg_api: {
      available: true,
      provider: "preview",
      last_updated: "2026-01-15T12:00:00Z"
    }
  },
  web_app_deep_link: "https://example.com/analyze?source=preview"
};

const PREVIEW_PAYLOAD: ScoredProductPayload = {
  product: {
    productUrl: "https://preview.local/item",
    productName: "Wide-Leg Regular Waist Jeans",
    brand: "H&M",
    category: "apparel",
    currency: "USD",
    retailerDomain: "preview.local",
    descriptionText: "",
    fiberText: "",
    fiberContent: {},
    price: 99.9
  },
  score: mapScoreApiResponse(PREVIEW_RAW),
  scoredAt: new Date().toISOString()
};

type LoadState = "loading" | "ready" | "fatal";
type ActiveTabContext = { url: string; title: string };

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  });

const gradeLabel = (grade: string) =>
  grade === "A"
    ? "Excellent"
    : grade === "B"
      ? "Good"
      : grade === "C"
        ? "Average"
        : grade === "D"
          ? "Below Average"
          : "Poor";

const Logo = ({ size = 28 }: { size?: number }) => (
  <img
    src={logoUrl}
    alt="Unraveled logo"
    style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
  />
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="2.5" stroke="#5f6642" strokeWidth="1.5" fill="none" />
    <path
      d="M8.17 2.33a2 2 0 0 1 3.66 0l.26.65a1 1 0 0 0 1.4.52l.63-.33a2 2 0 0 1 2.59 2.59l-.33.63a1 1 0 0 0 .52 1.4l.65.26a2 2 0 0 1 0 3.66l-.65.26a1 1 0 0 0-.52 1.4l.33.63a2 2 0 0 1-2.59 2.59l-.63-.33a1 1 0 0 0-1.4.52l-.26.65a2 2 0 0 1-3.66 0l-.26-.65a1 1 0 0 0-1.4-.52l-.63.33a2 2 0 0 1-2.59-2.59l.33-.63a1 1 0 0 0-.52-1.4l-.65-.26a2 2 0 0 1 0-3.66l.65-.26a1 1 0 0 0 .52-1.4l-.33-.63A2 2 0 0 1 6.28 3.3l.63.33a1 1 0 0 0 1.4-.52l.26-.65Z"
      stroke="#5f6642"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const NavStackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="16" height="3" rx="1" stroke="#5f6642" strokeWidth="1.4" fill="none" />
    <rect x="3" y="9.5" width="16" height="3" rx="1" stroke="#5f6642" strokeWidth="1.4" fill="none" />
    <rect x="3" y="15" width="16" height="3" rx="1" stroke="#5f6642" strokeWidth="1.4" fill="none" />
  </svg>
);

const NavChartIcon = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="12" width="4" height="7" rx="1" fill={active ? "white" : "#5f6642"} />
    <rect x="9" y="7.5" width="4" height="11.5" rx="1" fill={active ? "white" : "#5f6642"} />
    <rect x="15" y="3" width="4" height="16" rx="1" fill={active ? "white" : "#5f6642"} />
  </svg>
);

const NavProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="8" r="3.5" stroke="#5f6642" strokeWidth="1.4" />
    <path
      d="M3.5 19c0-4.14 3.36-7 7.5-7s7.5 2.86 7.5 7"
      stroke="#5f6642"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const TrendIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 9.5L4.5 5.5L7 8L11.5 3"
      stroke="#5f6642"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 3h2.5v2.5"
      stroke="#5f6642"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CostIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="11" height="8" rx="1.5" stroke="#7a2d2d" strokeWidth="1.3" fill="none" />
    <path d="M1 6h11" stroke="#7a2d2d" strokeWidth="1.3" />
    <path d="M4 6v5M9 6v5" stroke="#7a2d2d" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AlternativesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 7c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5Z"
      stroke="#5f6642"
      strokeWidth="1.3"
      fill="none"
    />
    <path
      d="M7 4.5v3l2 1.5"
      stroke="#5f6642"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FiberIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 1.5v11M4 4l3-2.5 3 2.5M4 10l3 2.5 3-2.5"
      stroke="#5f6642"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ScoreRing = ({ score, grade }: { score: number; grade: string }) => {
  const r = 32;
  const cx = 42;
  const cy = 42;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);

  const strokeColor =
    grade === "A"
      ? "#3d8c3a"
      : grade === "B"
        ? "#5a9c4a"
        : grade === "C"
          ? "#3d5c3a"
          : grade === "D"
            ? "#b08040"
            : "#b04040";

  return (
    <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="none" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(95,102,66,0.15)" strokeWidth="6" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1.2
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "#5f6642" }}>{grade} -</span>
        <span style={{ fontSize: 10, color: "#5f6642", fontWeight: 500 }}>{gradeLabel(grade)}</span>
      </div>
    </div>
  );
};

const FabricWrapper = ({ children, url }: { children: React.ReactNode; url: string }) => (
  <div
    style={{
      padding: 14,
      background: `url("${url}") center/cover`,
      borderRadius: 4,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}
  >
    {children}
  </div>
);

const isExtension = typeof chrome !== "undefined" && !!chrome?.runtime?.id;

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
  acrylic: 28
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
  const [savedPriceInput, setSavedPriceInput] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

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
    if (!isExtension) {
      setLoadState("ready");
      return;
    }

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

    const message: RuntimeMessage = { type: "UNRAVEL_GET_SCORE_FOR_TAB", tabId: tab.id };
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        setLoadState("ready");
        return;
      }
      applyTabState((response.data as TabScoreState | null) ?? null);
      setLoadState("ready");
    });
  };

  useEffect(() => {
    void loadCurrentTabScore();
  }, []);

  const saveUserPriceAndRescore = () => {
    if (!tabId || !payload?.product.productUrl) {
      return;
    }
    const parsed = Number(savedPriceInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setManualError("Enter a valid price greater than 0.");
      return;
    }
    setSavingPrice(true);
    setManualError("");
    void (async () => {
      try {
        await writePriceOverride(payload.product.productUrl, parsed);
        const message: RuntimeMessage = { type: "UNRAVEL_REFRESH_SCORE_FOR_TAB", tabId };
        chrome.runtime.sendMessage(message, (response) => {
          setSavingPrice(false);
          if (chrome.runtime.lastError || !response?.ok || !response?.data) {
            setManualError("Could not rescore with saved price.");
            return;
          }
          applyTabState(response.data as TabScoreState);
        });
      } catch {
        setSavingPrice(false);
        setManualError("Could not save price.");
      }
    })();
  };

  const refreshScore = () => {
    if (!isExtension || !tabId) {
      return;
    }
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
      if (nextState.status === "error") {
        setManualError(nextState.errorMessage ?? "Backend score unavailable.");
      }
    });
  };

  const submitManualFiber = () => {
    if (!isExtension || !tabId || !manualFiberText.trim()) {
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

  const payload: ScoredProductPayload | null = isExtension
    ? (tabScoreState?.payload ?? null)
    : PREVIEW_PAYLOAD;

  const scoreWidth = useMemo(() => {
    if (!payload) {
      return "0%";
    }
    return `${Math.max(0, Math.min(100, payload.score.sustainabilityScore.value))}%`;
  }, [payload]);

  const insightTip = useMemo(() => {
    if (!payload?.product.price) {
      return null;
    }
    const breakdown = payload.score.sustainabilityScore.featureContributions.fiberComposition.breakdown;
    if (breakdown.length === 0) {
      return null;
    }
    const dominant = breakdown.reduce((a, b) => (b.pct > a.pct ? b : a));
    const durabilityWears = resolveDurabilityWears(dominant.fiber);
    if (!durabilityWears) {
      return null;
    }
    const idealCpw = payload.product.price / durabilityWears;
    return { fiberName: dominant.fiber, wears: durabilityWears, cpw: idealCpw };
  }, [payload]);

  if (loadState === "loading") {
    return (
      <div className="popup-shell" style={{ background: "#E2E6C1", justifyContent: "center", gap: 12 }}>
        <div className="spinner" />
        <p style={{ margin: 0, fontSize: 12, color: "#5f6642" }}>Analyzing this product…</p>
      </div>
    );
  }

  if (loadState === "fatal") {
    return (
      <div className="popup-shell" style={{ background: "#E2E6C1", gap: 8, paddingTop: 32 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#2d4a2d" }}>Could not load tab</p>
        <p style={{ margin: 0, fontSize: 12, color: "#5f6642", textAlign: "center" }}>
          Open a supported retailer page, then click the extension icon.
        </p>
        <button type="button" className="action-btn-primary" style={{ marginTop: 16 }} onClick={() => void loadCurrentTabScore()}>
          Retry
        </button>
      </div>
    );
  }

  if (isExtension && !payload) {
    const isUnavailable =
      tabScoreState?.status === "error" &&
      (tabScoreState.errorCode === "source_unavailable" || tabScoreState.errorCode === "http_status");

    return (
      <FabricWrapper url={fabricUrl}>
        <main className="popup-main">
          <div className="top-bar">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Logo size={34} />
              <span className="brand-name">UNRAVELED</span>
            </div>
          </div>
          <div className="product-info">
            <h2 className="product-name" style={{ fontSize: 18 }}>
              Manual score
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#5f6642", lineHeight: 1.4 }}>
              {isUnavailable
                ? "Live Google Trends + ESG scoring is currently unavailable."
                : "No product score yet. Enter details below or open a product page."}
            </p>
          </div>
          <div className="section-pad" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              type="button"
              className="action-btn-primary"
              style={{ marginTop: 0 }}
              disabled={refreshing || manualSubmitting}
              onClick={refreshScore}
            >
              {refreshing ? "Refreshing…" : "Retry live score"}
            </button>
            <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#5f6642" }}>PRODUCT NAME</label>
            <input
              style={{
                border: "1px solid rgba(95,102,66,0.35)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 13,
                fontFamily: "inherit",
                color: "#2d4a2d"
              }}
              value={manualProductName}
              onChange={(e) => setManualProductName(e.target.value)}
            />
            <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#5f6642" }}>BRAND</label>
            <input
              style={{
                border: "1px solid rgba(95,102,66,0.35)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 13,
                fontFamily: "inherit",
                color: "#2d4a2d"
              }}
              value={manualBrand}
              onChange={(e) => setManualBrand(e.target.value)}
              placeholder="e.g. Zara, H&M"
            />
            <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#5f6642" }}>PRICE (OPTIONAL)</label>
            <input
              style={{
                border: "1px solid rgba(95,102,66,0.35)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 13,
                fontFamily: "inherit",
                color: "#2d4a2d"
              }}
              inputMode="decimal"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              placeholder="49.90"
            />
            <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#5f6642" }}>FIBER CONTENT</label>
            <textarea
              style={{
                border: "1px solid rgba(95,102,66,0.35)",
                borderRadius: 8,
                padding: 10,
                fontSize: 12,
                minHeight: 72,
                fontFamily: "inherit",
                color: "#2d4a2d",
                resize: "none"
              }}
              value={manualFiberText}
              onChange={(e) => setManualFiberText(e.target.value)}
              placeholder="55% linen, 30% cotton, 15% polyester"
            />
            {manualError ? (
              <p style={{ color: "#b04040", fontSize: 12, margin: 0 }}>{manualError}</p>
            ) : null}
            <button
              type="button"
              className="action-btn-primary"
              disabled={manualSubmitting || !manualFiberText.trim()}
              onClick={submitManualFiber}
            >
              {manualSubmitting ? "Scoring…" : "Score with manual fiber input"}
            </button>
          </div>
          <div className="bottom-nav">
            <button type="button" aria-label="History" className="nav-btn">
              <NavStackIcon />
            </button>
            <div className="nav-active-pill">
              <NavChartIcon active />
            </div>
            <button type="button" aria-label="Profile" className="nav-btn">
              <NavProfileIcon />
            </button>
          </div>
        </main>
      </FabricWrapper>
    );
  }

  if (!payload) {
    return null;
  }

  const grade = payload.score.sustainabilityScore.grade;
  const scoreValue = payload.score.sustainabilityScore.value;
  const isManualMode =
    payload.manualMode === true || payload.score.sustainabilityScore.scoringMode === "fiber_only";
  const hasFiberData = payload.score.cpwEstimate.fiberDataAvailable;
  const priceAvailable = isCpwPriceAvailable(payload.score.cpwEstimate, payload.product);
  const hasBrandData = payload.score.sustainabilityScore.featureContributions.brandReputation.brandDataAvailable;
  const esgSource = payload.score.sustainabilityScore.featureContributions.brandReputation.sources.esgApi;

  return (
    <FabricWrapper url={fabricUrl}>
      <main className="popup-main">
        <div className="top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={34} />
            <span className="brand-name">UNRAVELED</span>
          </div>
          {isExtension ? (
            <button type="button" aria-label="Refresh score" className="icon-btn" onClick={refreshScore}>
              <SettingsIcon />
            </button>
          ) : (
            <button type="button" aria-label="Preview" className="icon-btn" disabled>
              <SettingsIcon />
            </button>
          )}
        </div>

        <div className="product-info">
          {payload.product.brand ? <p className="product-brand">{payload.product.brand.toUpperCase()}</p> : null}
          <h2 className="product-name">{payload.product.productName}</h2>
        </div>

        {tabScoreState?.status === "stale" ? (
          <div className="section-pad">
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "#8a6d2d",
                background: "rgba(255, 220, 120, 0.35)",
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(180, 140, 40, 0.4)"
              }}
            >
              Showing last cached score — data may be stale.
            </p>
          </div>
        ) : null}

        <div className="section-pad">
          <div className="score-card-main">
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="score-label-text">SUSTAINABILITY SCORE</p>
              <p className="score-number">
                {scoreValue}
                <span className="score-denom"> /100</span>
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 10, color: "#5f6642", lineHeight: 1.35 }}>
                Fiber {payload.score.sustainabilityScore.featureContributions.fiberComposition.featureValue.toFixed(2)}
                {!isManualMode && (
                  <> · Brand {payload.score.sustainabilityScore.featureContributions.brandReputation.featureValue.toFixed(2)}</>
                )}
                {" "}
                · Trend {payload.score.sustainabilityScore.featureContributions.microTrendLongevity.featureValue.toFixed(2)}
                {isManualMode ? <span style={{ opacity: 0.7 }}> (fiber-only)</span> : null}
              </p>
              <div className="trend-bar-track" style={{ marginTop: 10 }}>
                <div className="trend-bar-fill" style={{ width: scoreWidth }} />
              </div>
            </div>
            <ScoreRing score={scoreValue} grade={grade} />
          </div>
        </div>

        {insightTip ? (
          <div className="section-pad">
            <div
              style={{
                background: "#faf3d0",
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 11,
                color: "#3d4a2d",
                boxShadow: "0 2px 8px rgba(95,102,66,0.12)"
              }}
            >
              <strong style={{ color: "#5f6642" }}>{insightTip.fiberName}</strong> lasts ~{insightTip.wears} wears. Ideal CPW:{" "}
              {currencyFormatter(payload.product.currency).format(insightTip.cpw)}.
            </div>
          </div>
        ) : null}

        <div className="stat-cards-section">
          <div className="stat-cards-bg" style={{ backgroundImage: `url("${buttonsUrl}")` }} aria-hidden="true" />

          <div className="stat-card stat-card--blue">
            <div className="stat-card-header">
              <TrendIcon />
              <span className="stat-card-eyebrow">TREND</span>
            </div>
            <p className="stat-card-value-lg">
              {payload.score.trendScore.label}
              <br />
              <span style={{ fontSize: 12, fontWeight: 600 }}>~{payload.score.trendScore.lifespanWeeks} weeks</span>
            </p>
            <div className="trend-bar-track">
              <div
                className="trend-bar-fill"
                style={{ width: `${Math.min((payload.score.trendScore.lifespanWeeks / 52) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="stat-card stat-card--pink">
            <div className="stat-card-header">
              <CostIcon />
              <span className="stat-card-eyebrow" style={{ color: "#7a2d2d" }}>
                COST / WEAR
              </span>
            </div>
            {hasFiberData ? (
              priceAvailable ? (
                <>
                  <p className="stat-card-value-xl" style={{ color: "#7a2d2d" }}>
                    {currencyFormatter(payload.product.currency).format(payload.score.cpwEstimate.costPerWear)}
                  </p>
                  <p className="stat-card-sub" style={{ color: "#a05858" }}>
                    Adj. {currencyFormatter(payload.product.currency).format(payload.score.cpwEstimate.trendAdjustedCpw)} (trend-adjusted)
                  </p>
                </>
              ) : (
                <>
                  <p className="stat-card-value-xl" style={{ color: "#7a2d2d", fontSize: 18 }}>
                    —
                  </p>
                  <p className="stat-card-sub" style={{ color: "#a05858" }}>
                    Price not detected on this page.
                  </p>
                  {isExtension ? (
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <input
                        value={savedPriceInput}
                        onChange={(e) => setSavedPriceInput(e.target.value)}
                        inputMode="decimal"
                        placeholder="Price"
                        style={{
                          flex: 1,
                          border: "1px solid rgba(122,45,45,0.35)",
                          borderRadius: 8,
                          padding: "6px 8px",
                          fontSize: 12,
                          fontFamily: "inherit"
                        }}
                      />
                      <button
                        type="button"
                        className="action-btn-secondary"
                        style={{ padding: "8px 12px", flex: "0 0 auto" }}
                        disabled={savingPrice}
                        onClick={saveUserPriceAndRescore}
                      >
                        {savingPrice ? "…" : "Save"}
                      </button>
                    </div>
                  ) : null}
                </>
              )
            ) : (
              <p className="stat-card-sub" style={{ color: "#a05858", marginTop: 8 }}>
                Fiber data unavailable for CPW.
              </p>
            )}
          </div>
        </div>

        <div className="section-pad">
          <div className="health-card">
            <div className="health-check-circle">
              <CheckIcon />
            </div>
            <div>
              <p className="stat-card-eyebrow">HEALTH &amp; SAFETY</p>
              <p className="health-text">
                {payload.score.healthScore.label}
                {": "}
                {payload.score.healthScore.flags.length > 0
                  ? payload.score.healthScore.flags.join(", ")
                  : "No known concern flags"}
              </p>
            </div>
          </div>
        </div>

        <div className="section-pad">
          <button
            type="button"
            className="action-btn-primary"
            style={{ marginTop: 0 }}
            onClick={() => {
              if (isExtension) {
                void chrome.tabs.create({ url: payload.score.webAppDeepLink });
              }
            }}
          >
            SEE FULL TREND ANALYSIS
          </button>

          <div className="secondary-btn-row">
            <button type="button" className="action-btn-secondary" disabled title="Coming soon">
              <AlternativesIcon />
              ALTERNATIVES
            </button>
            <button
              type="button"
              className="action-btn-secondary"
              onClick={() => {
                if (!isExtension || typeof tabId !== "number") {
                  return;
                }
                chrome.tabs.sendMessage(tabId, { type: "UNRAVEL_DOWNLOAD_FIBER_DATA" }, (response) => {
                  if (response?.ok) {
                    console.log(`Downloaded ${response.count} fiber data entries`);
                  }
                });
              }}
            >
              <FiberIcon />
              FIBER DATA
            </button>
          </div>
        </div>

        <details className="section-pad" style={{ paddingBottom: 8 }}>
          <summary
            style={{
              cursor: "pointer",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#5f6642",
              listStyle: "none"
            }}
          >
            DATA SOURCES
          </summary>
          <div style={{ marginTop: 8, fontSize: 11, color: "#5f6642", lineHeight: 1.5 }}>
            <p style={{ margin: 0 }}>
              Trend: Google Trends · Updated {formatTimestamp(payload.score.trendScore.lastUpdated)}
            </p>
            {!isManualMode && hasBrandData ? (
              <p style={{ margin: "6px 0 0" }}>
                ESG: {esgSource.provider} · Updated {formatTimestamp(esgSource.lastUpdated)}
              </p>
            ) : null}
            {!isManualMode && !hasBrandData ? (
              <p style={{ margin: "6px 0 0", opacity: 0.75 }}>ESG: No brand match — default score used.</p>
            ) : null}
          </div>
        </details>

        {isExtension ? (
          <div className="section-pad" style={{ borderTop: "1px dashed rgba(95,102,66,0.25)", paddingTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <p className="stat-card-eyebrow" style={{ margin: 0 }}>
                MANUAL FIBER INPUT
              </p>
              <button
                type="button"
                className="action-btn-secondary"
                style={{ padding: "6px 12px", fontSize: 9 }}
                onClick={refreshScore}
                disabled={refreshing || manualSubmitting}
              >
                {refreshing ? "…" : "Retry live"}
              </button>
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#5f6642" }}>
              Paste composition text if extraction is wrong (e.g. 55% linen, 45% cotton).
            </p>
            <textarea
              value={manualFiberText}
              onChange={(e) => setManualFiberText(e.target.value)}
              style={{
                width: "100%",
                marginTop: 8,
                minHeight: 64,
                border: "1px solid rgba(95,102,66,0.35)",
                borderRadius: 10,
                padding: 8,
                fontSize: 12,
                fontFamily: "inherit",
                color: "#2d4a2d",
                resize: "none",
                boxSizing: "border-box"
              }}
            />
            {manualError ? <p style={{ color: "#b04040", fontSize: 12, margin: "6px 0 0" }}>{manualError}</p> : null}
            <button
              type="button"
              className="action-btn-primary"
              style={{ marginTop: 8 }}
              disabled={manualSubmitting || !manualFiberText.trim()}
              onClick={submitManualFiber}
            >
              {manualSubmitting ? "Scoring…" : "Re-score with manual fiber"}
            </button>
          </div>
        ) : null}

        {manualError && !isExtension ? (
          <p style={{ color: "#b04040", fontSize: 12, margin: "4px 16px 0", textAlign: "center" }}>{manualError}</p>
        ) : null}

        <div className="bottom-nav">
          <button type="button" aria-label="History" className="nav-btn">
            <NavStackIcon />
          </button>
          <div className="nav-active-pill">
            <NavChartIcon active />
          </div>
          <button type="button" aria-label="Profile" className="nav-btn">
            <NavProfileIcon />
          </button>
        </div>
      </main>
    </FabricWrapper>
  );
};

export default App;
