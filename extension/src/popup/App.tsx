import { useEffect, useState } from "react";
import type { RuntimeMessage, TabScoreState } from "../types";

// ─── asset imports (Vite resolves these to hashed URLs at build time) ─────────
import logoUrl from "./assets/logo.png";
import buttonsUrl from "./assets/buttons.png";
import fabricUrl from "./assets/fabric.png";

// ─── helpers ──────────────────────────────────────────────────────────────────
type LoadState = "loading" | "ready" | "fatal";

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

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

// ─── grade helpers ─────────────────────────────────────────────────────────────
const gradeLabel = (grade: string) =>
  grade === "A" ? "Excellent"
  : grade === "B" ? "Good"
  : grade === "C" ? "Average"
  : grade === "D" ? "Below Average"
  : "Poor";

/** Cream for high grades, warm salmon/pink for mid-low grades */
const gradeBadgeBg = (grade: string) =>
  grade === "A" || grade === "B" ? "#d8e6cf" : "#e8c8c8";

const gradeBadgeColor = (grade: string) =>
  grade === "A" || grade === "B" ? "#2d4a2d" : "#7a2d2d";

// ─── component ────────────────────────────────────────────────────────────────
const App = () => {
  const [tabId, setTabId] = useState<number | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [tabScoreState, setTabScoreState] = useState<TabScoreState | null>(null);
  const [manualProductName, setManualProductName] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [manualError, setManualError] = useState("");

  // Inject CSS custom properties so popup.css (.popup-border etc.) can use them
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--logo-url", `url("${logoUrl}")`);
    root.style.setProperty("--buttons-bg", `url("${buttonsUrl}")`);
    root.style.setProperty(
      "--fabric-border",
      `url("${fabricUrl}") 40 round`
    );
  }, []);

  const applyTabState = (state: TabScoreState | null) => {
    setTabScoreState(state);
    if (!state?.payload) return;
    setManualProductName(state.payload.product.productName);
  };

  const loadCurrentTabScore = async () => {
    setLoadState("loading");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setLoadState("fatal");
      return;
    }

    setTabId(tab.id);
    if (!manualProductName) setManualProductName(tab.title ?? "Manual Product");

    const message: RuntimeMessage = {
      type: "UNRAVEL_GET_SCORE_FOR_TAB",
      tabId: tab.id,
    };

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

  const refreshScore = () => {
    if (!tabId) return;
    setRefreshing(true);
    setManualError("");

    const message: RuntimeMessage = {
      type: "UNRAVEL_REFRESH_SCORE_FOR_TAB",
      tabId,
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

  const payload = tabScoreState?.payload ?? null;

  // const insightTip = useMemo(() => {
  //   if (!payload?.product.price) return null;
  //   const breakdown =
  //     payload.score.sustainabilityScore.featureContributions.fiberComposition
  //       .breakdown;
  //   if (breakdown.length === 0) return null;
  //   const dominant = breakdown.reduce((a, b) => (b.pct > a.pct ? b : a));
  //   const durabilityWears = resolveDurabilityWears(dominant.fiber);
  //   if (!durabilityWears) return null;
  //   return {
  //     fiberName: dominant.fiber,
  //     wears: durabilityWears,
  //     cpw: payload.product.price / durabilityWears,
  //   };
  // }, [payload]);

  // ── loading ──────────────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div
        className="popup-shell"
        style={{
          background: "#E2E6C1",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "3px solid #b8c9a8",
            borderTopColor: "#3d5c3a",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ margin: 0, fontSize: 12, color: "#5a7a5a" }}>
          Analyzing this product…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // ── fatal ─────────────────────────────────────────────────────────────────────
  if (loadState === "fatal") {
    return (
      <div className="popup-shell" style={{ background: "#E2E6C1", gap: 8, paddingTop: 32 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#2d4a2d" }}>
          Could not load tab
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#5a7a5a", textAlign: "center" }}>
          Open a supported retailer page, then click the extension icon.
        </p>
        <button
          type="button"
          className="action-btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => void loadCurrentTabScore()}
        >
          Retry
        </button>
      </div>
    );
  }

  // ── no payload yet — landing / "Get Score" screen ────────────────────────────
  if (!payload) {
    return (
      <div
        className="popup-border"
        style={{
          width: 360,
          minHeight: 560,
          background: "#E2E6C1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 24px",
          boxSizing: "border-box",
          fontFamily: '"STIX Two Text", Georgia, serif',
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <img
            src={logoUrl}
            alt="Unraveled logo"
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.08em",
              color: "#3d5c3a",
            }}
          >
            UNRAVELED
          </span>
        </div>

        <p
          style={{
            color: "#5C6C47",
            fontSize: 13,
            textAlign: "center",
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          The sustainability of your clothes
          <br />
          <strong>UNRAVELED.</strong>
        </p>

        <p
          style={{
            color: "#5C6C47",
            fontSize: 13,
            textAlign: "center",
            marginTop: 40,
            lineHeight: 1.6,
            padding: "0 8px",
          }}
        >
          See how sustainable your current product page is — click below to
          analyze it.
        </p>

        <button
          type="button"
          disabled={refreshing}
          onClick={refreshScore}
          style={{
            marginTop: 40,
            fontFamily: '"STIX Two Text", Georgia, serif',
            background: "#3d5c3a",
            color: "white",
            border: "none",
            borderRadius: 999,
            padding: "14px 48px",
            fontSize: 15,
            fontWeight: 700,
            cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.7 : 1,
          }}
        >
          {refreshing ? "Analyzing…" : "Get Score"}
        </button>

        {manualError && (
          <p style={{ color: "#b04040", fontSize: 12, marginTop: 12, textAlign: "center" }}>
            {manualError}
          </p>
        )}
      </div>
    );
  }

  // ── scored result ─────────────────────────────────────────────────────────────
  const grade = payload.score.sustainabilityScore.grade;
  const scoreValue = payload.score.sustainabilityScore.value;

  return (
    <main
      className="popup-border"
      style={{
        background: "#d6dfc8",
        width: 360,
        minHeight: 560,
        fontFamily: '"STIX Two Text", Georgia, serif',
        padding: "0 0 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "12px 16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={logoUrl}
            alt="logo"
            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#2d4a2d",
            }}
          >
            UNRAVELED
          </span>
        </div>
        <button
          type="button"
          aria-label="Settings"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 18 }}
        >
          ⚙️
        </button>
      </div>

      {/* ── Product info ── */}
      <div style={{ width: "100%", padding: "0 16px", boxSizing: "border-box" }}>
        {payload.product.brand && (
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              color: "#5a7a5a",
              letterSpacing: "0.05em",
            }}
          >
            {payload.product.brand.toUpperCase()}
          </p>
        )}
        <h2
          style={{
            margin: "2px 0 0",
            fontSize: 22,
            fontWeight: 700,
            color: "#2d4a2d",
            lineHeight: 1.2,
          }}
        >
          {payload.product.productName}
        </h2>
      </div>

      {/* ── Sustainability score card ── */}
      <div style={{ width: "100%", padding: "10px 16px 0", boxSizing: "border-box" }}>
        <div
          style={{
            background: "#f5f0e8",
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* score number */}
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#5a7a5a",
              }}
            >
              SUSTAINABILITY SCORE
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 38,
                fontWeight: 700,
                color: "#2d4a2d",
                lineHeight: 1,
              }}
            >
              {scoreValue}
              <span style={{ fontSize: 14, fontWeight: 400, color: "#5a7a5a" }}>
                {" "}
                /100
              </span>
            </p>
          </div>

          {/* grade badge */}
          <div
            style={{
              background: gradeBadgeBg(grade),
              borderRadius: 12,
              padding: "10px 18px",
              textAlign: "center",
              minWidth: 72,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: gradeBadgeColor(grade),
              }}
            >
              {grade}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: gradeBadgeColor(grade) }}>
              {gradeLabel(grade)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Trend Velocity + Cost/Wear cards ── */}
      <div
        className="score-cards-row"
        style={{ padding: "0 16px", marginTop: 10 }}
      >
        {/* Trend velocity */}
        <div
          className="score-card"
          style={{
            backgroundImage: `url("${buttonsUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* slight overlay so text stays readable */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(238,242,230,0.55)",
              borderRadius: 14,
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#2d4a2d",
              position: "relative",
              zIndex: 1,
            }}
          >
            📈 TREND VELOCITY
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 14,
              fontWeight: 600,
              color: "#2d4a2d",
              position: "relative",
              zIndex: 1,
            }}
          >
            Trending ~{payload.score.trendScore.lifespanWeeks} weeks
          </p>
        </div>

        {/* Cost / wear */}
        <div
          className="score-card"
          style={{
            backgroundImage: `url("${buttonsUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(238,242,230,0.55)",
              borderRadius: 14,
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#2d4a2d",
              position: "relative",
              zIndex: 1,
            }}
          >
            🪡 COST / WEAR
          </p>
          {payload.score.cpwEstimate.fiberDataAvailable ? (
            <>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#2d4a2d",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {currencyFormatter(payload.product.currency).format(
                  payload.score.cpwEstimate.costPerWear
                )}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 10,
                  color: "#5a7a5a",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Based on standard product lifecycle
              </p>
            </>
          ) : (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                color: "#5a7a5a",
                position: "relative",
                zIndex: 1,
              }}
            >
              Based on standard product lifecycle
            </p>
          )}
        </div>
      </div>

      {/* ── Health & Safety card ── */}
      <div style={{ width: "100%", padding: "10px 16px 0", boxSizing: "border-box" }}>
        <div className="health-card">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#3d5c3a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "white", fontSize: 14, lineHeight: 1 }}>✓</span>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#5a7a5a",
              }}
            >
              HEALTH &amp; SAFETY
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#2d4a2d" }}>
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
      <div style={{ width: "100%", padding: "0 16px", boxSizing: "border-box" }}>
        <button
          type="button"
          className="action-btn-primary"
          onClick={() => {
            void chrome.tabs.create({ url: payload.score.webAppDeepLink });
          }}
        >
          SEE FULL TREND ANALYSIS
        </button>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="button" className="action-btn-secondary">
            ♻️ ALTERNATIVES
          </button>
          <button type="button" className="action-btn-secondary">
            🧵 FIBER DATA
          </button>
        </div>
      </div>

      {manualError && (
        <p
          style={{
            color: "#b04040",
            fontSize: 12,
            margin: "8px 16px 0",
            textAlign: "center",
          }}
        >
          {manualError}
        </p>
      )}

      {/* ── Bottom nav ── */}
      <div className="bottom-nav">
        <button
          type="button"
          aria-label="Home"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4 }}
        >
          🏠
        </button>

        {/* active tab indicator */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#3d5c3a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 20 }}>📊</span>
        </div>

        <button
          type="button"
          aria-label="Profile"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4 }}
        >
          👤
        </button>
      </div>
    </main>
  );
};

export default App;