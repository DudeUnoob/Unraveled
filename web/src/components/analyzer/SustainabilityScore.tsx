"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { ExtensionData } from "@/types/analysis";
import { Leaf, Star, ChartLine, Heartbeat, PuzzlePiece } from "@phosphor-icons/react";
import { computeClientSustainabilityScore } from "@/lib/sustainability";

interface SustainabilityScoreProps {
    extensionData?: ExtensionData | null;
    trendLabel: string;
    weeksRemaining?: number;
}

function getGradeColor(grade: string): string {
    switch (grade.toUpperCase()) {
        case "A": return "#2C4A3E";
        case "B": return "#7A9E8E";
        case "C": return "#D4883C";
        case "D": return "#C84B31";
        case "F": return "#991B1B";
        default: return "#7A9E8E";
    }
}

function getGradeLabel(grade: string): string {
    switch (grade.toUpperCase()) {
        case "A": return "Excellent";
        case "B": return "Good";
        case "C": return "Average";
        case "D": return "Poor";
        case "F": return "Avoid";
        default: return "Unknown";
    }
}

function getHealthIcon(label: string) {
    switch (label.toLowerCase()) {
        case "safe":
            return { color: "#2C4A3E", bg: "#2C4A3E12" };
        case "caution":
            return { color: "#D4883C", bg: "#D4883C12" };
        case "avoid":
            return { color: "#C84B31", bg: "#C84B3112" };
        default:
            return { color: "#888", bg: "#88888812" };
    }
}

// Approximate feature values from score and label (extension mode)
function estimateFeatureContributions(score: number, trendLabel: string) {
    const trendFeatureMap: Record<string, number> = {
        "Timeless": 1.0,
        "Trending": 0.75,
        "Fading": 0.4,
        "Dead": 0.1,
    };
    const trendFeature = trendFeatureMap[trendLabel] ?? 0.75;
    const trendContribution = trendFeature * 0.2 * 100;

    const remaining = score - trendContribution;
    const fiberContribution = remaining * 0.625;
    const brandContribution = remaining * 0.375;

    return {
        fiber: { value: fiberContribution / 50, weight: 0.5, points: Math.round(fiberContribution) },
        brand: { value: brandContribution / 30, weight: 0.3, points: Math.round(brandContribution) },
        trend: { value: trendFeature, weight: 0.2, points: Math.round(trendContribution) },
    };
}

export const SustainabilityScore = memo(function SustainabilityScore({
    extensionData,
    trendLabel,
    weeksRemaining,
}: SustainabilityScoreProps) {
    const isExtensionMode = extensionData != null && extensionData.sustainabilityScore > 0;

    // Compute score values depending on mode
    let score: number;
    let grade: string;
    let gradeLabel: string;
    let features: ReturnType<typeof estimateFeatureContributions>;
    let effectiveTrendLabel: string;

    if (isExtensionMode) {
        score = extensionData.sustainabilityScore;
        grade = extensionData.sustainabilityGrade;
        gradeLabel = getGradeLabel(grade);
        effectiveTrendLabel = extensionData.trendLabel || trendLabel;
        features = estimateFeatureContributions(score, effectiveTrendLabel);
    } else {
        const result = computeClientSustainabilityScore(trendLabel);
        score = result.score;
        grade = result.grade;
        gradeLabel = result.gradeLabel;
        effectiveTrendLabel = trendLabel;
        features = {
            fiber: { value: result.fiberFeature, weight: 0.5, points: Math.round(result.fiberFeature * 50) },
            brand: { value: result.brandFeature, weight: 0.3, points: Math.round(result.brandFeature * 30) },
            trend: { value: result.trendFeature, weight: 0.2, points: Math.round(result.trendFeature * 20) },
        };
    }

    const gradeColor = getGradeColor(grade);
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-sans text-sm font-semibold text-charcoal/60 uppercase tracking-widest">
                    Sustainability Score
                </h3>
                <div className="flex items-center gap-1.5">
                    <Leaf weight="duotone" className="w-3.5 h-3.5 text-charcoal/30" />
                    <span className="font-mono text-[10px] text-charcoal/35 uppercase tracking-wider">
                        {isExtensionMode ? "ML-generated" : "Estimated"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-start">
                {/* Score Gauge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-[148px] h-[148px] mx-auto sm:mx-0"
                >
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle
                            cx="60" cy="60" r={radius}
                            fill="none"
                            stroke="rgba(28,28,28,0.06)"
                            strokeWidth="8"
                        />
                        <motion.circle
                            cx="60" cy="60" r={radius}
                            fill="none"
                            stroke={gradeColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: circumference - progress }}
                            transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="font-mono text-3xl font-bold tabular-nums"
                            style={{ color: gradeColor }}
                        >
                            {score}
                        </motion.span>
                        <span
                            className="font-mono text-sm font-semibold uppercase tracking-wider"
                            style={{ color: gradeColor }}
                        >
                            {grade} · {gradeLabel}
                        </span>
                    </div>
                </motion.div>

                {/* Feature Breakdown */}
                <div className="space-y-4">
                    {/* Fiber Composition */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <Star weight="duotone" className="w-4 h-4 text-[#2C4A3E]" />
                            <span className="font-sans text-sm font-medium text-charcoal">Fiber Composition</span>
                            <span className="ml-auto font-mono text-xs text-charcoal/40 tabular-nums">
                                {features.fiber.value.toFixed(2)} ×{(features.fiber.weight * 100).toFixed(0)}%
                            </span>
                            <span className="font-mono text-xs font-semibold text-charcoal tabular-nums">
                                → {features.fiber.points} pts
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-charcoal/[0.06] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, features.fiber.value * 100)}%` }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="h-full rounded-full bg-[#2C4A3E]"
                            />
                        </div>
                        {isExtensionMode && extensionData.fiberComposition ? (
                            <p className="font-mono text-[10px] text-charcoal/40 tracking-wide pl-6">
                                {extensionData.fiberComposition}
                            </p>
                        ) : !isExtensionMode ? (
                            <p className="font-mono text-[10px] text-charcoal/30 tracking-wide pl-6">
                                Category default — install extension for exact fiber data
                            </p>
                        ) : null}
                    </motion.div>

                    {/* Brand Reputation */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <Leaf weight="duotone" className="w-4 h-4 text-[#7A9E8E]" />
                            <span className="font-sans text-sm font-medium text-charcoal">Brand Reputation</span>
                            <span className="ml-auto font-mono text-xs text-charcoal/40 tabular-nums">
                                {features.brand.value.toFixed(2)} ×{(features.brand.weight * 100).toFixed(0)}%
                            </span>
                            <span className="font-mono text-xs font-semibold text-charcoal tabular-nums">
                                → {features.brand.points} pts
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-charcoal/[0.06] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, features.brand.value * 100)}%` }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="h-full rounded-full bg-[#7A9E8E]"
                            />
                        </div>
                        {isExtensionMode && extensionData.brandRatingSources ? (
                            <p className="font-mono text-[10px] text-charcoal/40 tracking-wide pl-6">
                                {extensionData.brandRatingSources}
                            </p>
                        ) : isExtensionMode && extensionData.brand && extensionData.brand !== "Unknown" ? (
                            <p className="font-mono text-[10px] text-charcoal/30 tracking-wide pl-6">
                                Brand data unavailable — mid-range prior applied
                            </p>
                        ) : !isExtensionMode ? (
                            <p className="font-mono text-[10px] text-charcoal/30 tracking-wide pl-6">
                                Mid-range prior — install extension for brand ratings
                            </p>
                        ) : null}
                    </motion.div>

                    {/* Trend Longevity */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <ChartLine weight="duotone" className="w-4 h-4 text-[#D4883C]" />
                            <span className="font-sans text-sm font-medium text-charcoal">Trend Longevity</span>
                            <span className="ml-auto font-mono text-xs text-charcoal/40 tabular-nums">
                                {features.trend.value.toFixed(2)} ×{(features.trend.weight * 100).toFixed(0)}%
                            </span>
                            <span className="font-mono text-xs font-semibold text-charcoal tabular-nums">
                                → {features.trend.points} pts
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-charcoal/[0.06] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, features.trend.value * 100)}%` }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="h-full rounded-full bg-[#D4883C]"
                            />
                        </div>
                        <p className="font-mono text-[10px] text-charcoal/40 tracking-wide pl-6">
                            Status: {effectiveTrendLabel || "Unknown"}
                            {isExtensionMode && extensionData.trendLifespanWeeks > 0 && (
                                <> (~{extensionData.trendLifespanWeeks} wks remaining)</>
                            )}
                            {!isExtensionMode && weeksRemaining != null && weeksRemaining > 0 && (
                                <> (~{weeksRemaining} wks remaining)</>
                            )}
                        </p>
                    </motion.div>

                    {/* Health + Durability Row (extension only) */}
                    {isExtensionMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-wrap items-center gap-3 pt-3 border-t border-charcoal/[0.06]"
                        >
                            {(() => {
                                const healthInfo = getHealthIcon(extensionData.healthLabel);
                                return (
                                    <div
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                                        style={{ backgroundColor: healthInfo.bg }}
                                    >
                                        <Heartbeat weight="duotone" className="w-3.5 h-3.5" style={{ color: healthInfo.color }} />
                                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: healthInfo.color }}>
                                            {extensionData.healthLabel}
                                        </span>
                                    </div>
                                );
                            })()}
                            {extensionData.fiberDurabilityWears > 0 && (
                                <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">
                                    Fiber Durability: ~{extensionData.fiberDurabilityWears} wears
                                </span>
                            )}
                            {extensionData.brand && extensionData.brand !== "Unknown" && (
                                <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">
                                    Brand: {extensionData.brand}
                                </span>
                            )}
                        </motion.div>
                    )}

                    {/* Direct mode note */}
                    {!isExtensionMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-start gap-2 pt-3 border-t border-charcoal/[0.06]"
                        >
                            <PuzzlePiece weight="duotone" className="w-4 h-4 text-charcoal/30 shrink-0 mt-0.5" />
                            <p className="font-sans text-xs text-charcoal/40 leading-relaxed">
                                Estimated from trend data — install the Chrome Extension for detailed fiber and brand analysis.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
});
