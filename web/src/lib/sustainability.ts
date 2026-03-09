/**
 * Client-side sustainability score computation (PRD §6.5)
 * Used when extension data is not available.
 */

const FIBER_RANK: Record<string, number> = {
    "organic linen": 0.95,
    "hemp": 0.92,
    "organic cotton": 0.90,
    "tencel": 0.88,
    "lyocell": 0.88,
    "recycled wool": 0.85,
    "wool": 0.75,
    "silk": 0.70,
    "cotton": 0.65,
    "conventional cotton": 0.65,
    "recycled polyester": 0.60,
    "linen": 0.80,
    "viscose": 0.45,
    "rayon": 0.45,
    "modal": 0.50,
    "nylon": 0.30,
    "spandex": 0.30,
    "elastane": 0.30,
    "polyester": 0.25,
    "conventional polyester": 0.25,
    "acrylic": 0.20,
};

const TREND_FEATURE_MAP: Record<string, number> = {
    "Timeless": 1.0,
    "Trending": 0.75,
    "Fading": 0.40,
    "Dead": 0.10,
};

const DEFAULT_FIBER = 0.50;
const DEFAULT_BRAND = 0.40; // mid-range prior per PRD

export interface SustainabilityResult {
    score: number;
    grade: string;
    gradeLabel: string;
    fiberFeature: number;
    brandFeature: number;
    trendFeature: number;
}

/**
 * Parse a fiber composition string like "55% Linen · 30% Cotton · 15% Polyester"
 * and return a weighted average fiber score.
 */
function parseFiberComposition(composition: string): number {
    const parts = composition.split(/[·,;]+/).map(s => s.trim()).filter(Boolean);
    let totalWeight = 0;
    let weightedScore = 0;

    for (const part of parts) {
        const match = part.match(/(\d+)\s*%\s*(.+)/i);
        if (match) {
            const pct = parseInt(match[1], 10) / 100;
            const fiber = match[2].trim().toLowerCase();
            const score = FIBER_RANK[fiber] ?? DEFAULT_FIBER;
            weightedScore += pct * score;
            totalWeight += pct;
        }
    }

    return totalWeight > 0 ? weightedScore / totalWeight : DEFAULT_FIBER;
}

export function scoreToGrade(score: number): { grade: string; label: string } {
    if (score >= 80) return { grade: "A", label: "Excellent" };
    if (score >= 60) return { grade: "B", label: "Good" };
    if (score >= 40) return { grade: "C", label: "Average" };
    if (score >= 20) return { grade: "D", label: "Poor" };
    return { grade: "F", label: "Avoid" };
}

/**
 * Compute a client-side sustainability score from available data.
 * Formula: (fiber × 0.5 + brand × 0.3 + trend × 0.2) × 100
 */
export function computeClientSustainabilityScore(
    trendLabel: string,
    fiberComposition?: string,
    brandScore?: number,
): SustainabilityResult {
    const fiberFeature = fiberComposition ? parseFiberComposition(fiberComposition) : DEFAULT_FIBER;
    const brandFeature = brandScore ?? DEFAULT_BRAND;
    const trendFeature = TREND_FEATURE_MAP[trendLabel] ?? 0.75;

    const score = Math.round((fiberFeature * 0.5 + brandFeature * 0.3 + trendFeature * 0.2) * 100);
    const { grade, label } = scoreToGrade(score);

    return {
        score,
        grade,
        gradeLabel: label,
        fiberFeature,
        brandFeature,
        trendFeature,
    };
}
