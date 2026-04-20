import { useEffect, useState } from "react";
import type { RuntimeMessage, TabScoreState } from "../types";

import logoUrl from "./assets/logo.png";
import buttonsUrl from "./assets/buttons.png";
import fabricUrl from "./assets/fabric.png";

// ─── Mock payload for dev/preview (no Chrome runtime) ─────────────────────────
const MOCK_PAYLOAD = {
  product: {
    productName: "Wide-Leg Regular Waist Jeans",
    brand: "H&M",
    currency: "USD",
  },
  score: {
    sustainabilityScore: { grade: "C", value: 69 },
    trendScore: { lifespanWeeks: 14 },
    cpwEstimate: {
      fiberDataAvailable: true,
      costPerWear: 0.0,
    },
    healthScore: {
      label: "Safe",
      flags: [],
    },
    webAppDeepLink: "#",
  },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
type LoadState = "loading" | "ready" | "fatal";

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

const gradeLabel = (grade: string) =>
  grade === "A" ? "Excellent"
  : grade === "B" ? "Good"
  : grade === "C" ? "Average"
  : grade === "D" ? "Below Average"
  : "Poor";

// ─── Logo image helper ────────────────────────────────────────────────────────
const Logo = ({ size = 28 }: { size?: number }) => (
  <img
    src={logoUrl}
    alt="Unraveled logo"
    style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
  />
);

// ─── SVG Icons ────────────────────────────────────────────────────────────────
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
    <rect x="3" y="4" width="16" height="3" rx="1" stroke="#5f6642" strokeWidth="1.4" fill="none"/>
    <rect x="3" y="9.5" width="16" height="3" rx="1" stroke="#5f6642" strokeWidth="1.4" fill="none"/>
    <rect x="3" y="15" width="16" height="3" rx="1" stroke="#5f6642" strokeWidth="1.4" fill="none"/>
  </svg>
);

const NavChartIcon = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="12" width="4" height="7" rx="1" fill={active ? "white" : "#5f6642"}/>
    <rect x="9" y="7.5" width="4" height="11.5" rx="1" fill={active ? "white" : "#5f6642"}/>
    <rect x="15" y="3" width="4" height="16" rx="1" fill={active ? "white" : "#5f6642"}/>
  </svg>
);

const NavProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="8" r="3.5" stroke="#5f6642" strokeWidth="1.4"/>
    <path d="M3.5 19c0-4.14 3.36-7 7.5-7s7.5 2.86 7.5 7" stroke="#5f6642" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const TrendIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 9.5L4.5 5.5L7 8L11.5 3" stroke="#5f6642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 3h2.5v2.5" stroke="#5f6642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CostIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="11" height="8" rx="1.5" stroke="#7a2d2d" strokeWidth="1.3" fill="none"/>
    <path d="M1 6h11" stroke="#7a2d2d" strokeWidth="1.3"/>
    <path d="M4 6v5M9 6v5" stroke="#7a2d2d" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AlternativesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5Z" stroke="#5f6642" strokeWidth="1.3" fill="none"/>
    <path d="M7 4.5v3l2 1.5" stroke="#5f6642" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FiberIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.5v11M4 4l3-2.5 3 2.5M4 10l3 2.5 3-2.5" stroke="#5f6642" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Circular score ring ───────────────────────────────────────────────────────
const ScoreRing = ({ score, grade }: { score: number; grade: string }) => {
  const r = 32;
  const cx = 42;
  const cy = 42;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);

  const strokeColor =
    grade === "A" ? "#3d8c3a"
    : grade === "B" ? "#5a9c4a"
    : grade === "C" ? "#3d5c3a"
    : grade === "D" ? "#b08040"
    : "#b04040";

  return (
    <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="none" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(95,102,66,0.15)" strokeWidth="6" />
        <circle
          cx={cx} cy={cy} r={r}
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
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        lineHeight: 1.2,
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#5f6642" }}>{grade} -</span>
        <span style={{ fontSize: 10, color: "#5f6642", fontWeight: 500 }}>{gradeLabel(grade)}</span>
      </div>
    </div>
  );
};

// ─── Fabric wrapper — border-image lives here so border-radius on inner card works
const FabricWrapper = ({ children, url }: { children: React.ReactNode; url: string }) => (
  <div style={{
    padding: 14,
    background: `url("${url}") center/cover`,
    borderRadius: 4,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  }}>
    {children}
  </div>
);

// ─── Check if running inside Chrome extension ─────────────────────────────────
const isExtension = typeof chrome !== "undefined" && !!chrome?.runtime?.id;

// ─── component ────────────────────────────────────────────────────────────────
const App = () => {
  const [tabId, setTabId] = useState<number | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [tabScoreState, setTabScoreState] = useState<TabScoreState | null>(null);
  const [manualError, setManualError] = useState("");

  const applyTabState = (state: TabScoreState | null) => {
    setTabScoreState(state);
  };

  const loadCurrentTabScore = async () => {
    if (!isExtension) {
      setLoadState("ready");
      return;
    }

    setLoadState("loading");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) { setLoadState("fatal"); return; }
    setTabId(tab.id);
    const message: RuntimeMessage = { type: "UNRAVEL_GET_SCORE_FOR_TAB", tabId: tab.id };
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError || !response?.ok) { setLoadState("ready"); return; }
      applyTabState((response.data as TabScoreState | null) ?? null);
      setLoadState("ready");
    });
  };

  useEffect(() => { void loadCurrentTabScore(); }, []);

  const refreshScore = () => {
    if (!isExtension || !tabId) return;
    setManualError("");
    const message: RuntimeMessage = { type: "UNRAVEL_REFRESH_SCORE_FOR_TAB", tabId };
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError || !response?.ok || !response?.data) {
        setManualError("Could not refresh this product score.");
        return;
      }
      const nextState = response.data as TabScoreState;
      applyTabState(nextState);
      if (nextState.status === "error") setManualError(nextState.errorMessage ?? "Backend score unavailable.");
    });
  };

  // Always fall back to MOCK_PAYLOAD so the scored layout is always shown
  const payload = (tabScoreState?.payload ?? MOCK_PAYLOAD) as any;

  // ── loading ────────────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="popup-shell" style={{ background: "#E2E6C1", justifyContent: "center", gap: 12 }}>
        <div className="spinner" />
        <p style={{ margin: 0, fontSize: 12, color: "#5f6642" }}>Analyzing this product…</p>
      </div>
    );
  }

  // ── fatal ──────────────────────────────────────────────────────────────────
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

  // ── scored result ──────────────────────────────────────────────────────────
  const grade = payload.score.sustainabilityScore.grade;
  const scoreValue = payload.score.sustainabilityScore.value;

  return (
    <FabricWrapper url={fabricUrl}>
    <main
      className="popup-main"
    >
      {/* ── Top bar ── */}
      <div className="top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={34} />
          <span className="brand-name">UNRAVELED</span>
        </div>
        <button type="button" aria-label="Settings" className="icon-btn" onClick={refreshScore}>
          <SettingsIcon />
        </button>
      </div>

      {/* ── Product info ── */}
      <div className="product-info">
        {payload.product.brand && (
          <p className="product-brand">{payload.product.brand.toUpperCase()}</p>
        )}
        <h2 className="product-name">{payload.product.productName}</h2>
      </div>

      {/* ── Sustainability score card ── */}
      <div className="section-pad">
        <div className="score-card-main">
          <div>
            <p className="score-label-text">SUSTAINABILITY SCORE</p>
            <p className="score-number">
              {scoreValue}
              <span className="score-denom"> /100</span>
            </p>
          </div>
          <ScoreRing score={scoreValue} grade={grade} />
        </div>
      </div>

      {/* ── Trend + Cost/Wear — buttons.png bg ── */}
      <div className="stat-cards-section">
        <div
          className="stat-cards-bg"
          style={{ backgroundImage: `url("${buttonsUrl}")` }}
          aria-hidden="true"
        />

        {/* Trend Velocity */}
        <div className="stat-card stat-card--blue">
          <div className="stat-card-header">
            <TrendIcon />
            <span className="stat-card-eyebrow">TREND VELOCITY</span>
          </div>
          <p className="stat-card-value-lg">
            Trending ~{payload.score.trendScore.lifespanWeeks} weeks
          </p>
          <div className="trend-bar-track">
            <div
              className="trend-bar-fill"
              style={{ width: `${Math.min((payload.score.trendScore.lifespanWeeks / 52) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Cost / Wear */}
        <div className="stat-card stat-card--pink">
          <div className="stat-card-header">
            <CostIcon />
            <span className="stat-card-eyebrow" style={{ color: "#7a2d2d" }}>COST / WEAR</span>
          </div>
          {payload.score.cpwEstimate.fiberDataAvailable ? (
            <>
              <p className="stat-card-value-xl" style={{ color: "#7a2d2d" }}>
                {currencyFormatter(payload.product.currency).format(payload.score.cpwEstimate.costPerWear)}
              </p>
              <p className="stat-card-sub" style={{ color: "#a05858" }}>
                Based on standard product lifecycle
              </p>
            </>
          ) : (
            <p className="stat-card-sub" style={{ color: "#a05858", marginTop: 8 }}>
              Based on standard product lifecycle
            </p>
          )}
        </div>
      </div>

      {/* ── Health & Safety ── */}
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

      {/* ── Action buttons ── */}
      <div className="section-pad">
        <button
          type="button"
          className="action-btn-primary"
          onClick={() => { void chrome.tabs.create({ url: payload.score.webAppDeepLink }); }}
        >
          SEE FULL TREND ANALYSIS
        </button>

        <div className="secondary-btn-row">
          <button type="button" className="action-btn-secondary">
            <AlternativesIcon />
            ALTERNATIVES
          </button>
          <button type="button" className="action-btn-secondary">
            <FiberIcon />
            FIBER DATA
          </button>
        </div>
      </div>

      {manualError && (
        <p style={{ color: "#b04040", fontSize: 12, margin: "4px 16px 0", textAlign: "center" }}>
          {manualError}
        </p>
      )}

      {/* ── Bottom nav ── */}
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