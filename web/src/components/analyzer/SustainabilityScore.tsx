"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { BrandInfo, ExtensionData } from "@/types/analysis";
import { Leaf, Star, ChartLine, Heartbeat, PuzzlePiece, Info } from "@phosphor-icons/react";
import { computeClientSustainabilityScore } from "@/lib/sustainability";

interface SustainabilityScoreProps {
    extensionData?: ExtensionData | null;
    trendLabel: string;
    weeksRemaining?: number;
    brandInfo?: BrandInfo;
}

function getGradeColor(grade: string): string {
    switch (grade.toUpperCase()) {
        case "A": return "#5c6c47";
        case "B": return "#9fa586";
        case "C": return "#D4883C";
        case "D": return "#C84B31";
        case "F": return "#991B1B";
        default: return "#9fa586";
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
            return { color: "#5c6c47", bg: "#5c6c4712" };
        case "caution":
            return { color: "#D4883C", bg: "#D4883C12" };
        case "avoid":
            return { color: "#C84B31", bg: "#C84B3112" };
        default:
            return { color: "#888", bg: "#88888812" };
    }
}

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
    brandInfo,
}: SustainabilityScoreProps) {
    const isExtensionMode = extensionData != null && extensionData.sustainabilityScore > 0;

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
        const result = computeClientSustainabilityScore(trendLabel, undefined, brandInfo?.normalized_score);
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
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    return (
        <div className="w-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-1">
                    <h3 className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em]">
                        Sustainability Profile
                    </h3>
                    <p className="font-sans text-xs text-charcoal/40 font-medium">
                        {isExtensionMode ? "Analysis derived from real-time fiber & brand data." : "Estimated score based on trend profile and brand reputation."}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-light/20 border border-forest/5">
                    <Leaf weight="duotone" className="w-3.5 h-3.5 text-forest" />
                    <span className="font-mono text-[9px] font-bold text-forest/60 uppercase tracking-widest">
                        {isExtensionMode ? "ML Verified" : "System Estimated"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                {/* Score Gauge (Large & Premium) */}
                <div className="md:col-span-5 flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-[220px] h-[220px]"
                    >
                        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                            {/* Track */}
                            <circle
                                cx="80" cy="80" r={radius}
                                fill="none"
                                stroke="rgba(92,108,71,0.05)"
                                strokeWidth="12"
                            />
                            {/* Progress */}
                            <motion.circle
                                cx="80" cy="80" r={radius}
                                fill="none"
                                stroke={gradeColor}
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference - progress }}
                                transition={{ delay: 0.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            />
                            
                            {/* Active Pulse Micro-interaction */}
                            <motion.circle
                                cx="80" cy="80" r={radius}
                                fill="none"
                                stroke={gradeColor}
                                strokeWidth="12"
                                strokeLinecap="round"
                                opacity="0.2"
                                animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.05, 0.2] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            />
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.8 }}
                            >
                                <span className="block font-sans text-7xl font-bold tracking-tighter tabular-nums mb-1" style={{ color: gradeColor }}>
                                    {score}
                                </span>
                                <span className="block font-mono text-xs font-bold uppercase tracking-[0.2em]" style={{ color: `${gradeColor}80` }}>
                                    Grade {grade}
                                </span>
                                <span className="block font-sans text-[10px] font-bold text-charcoal/30 uppercase mt-1">
                                    {gradeLabel}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Feature Breakdown (Bento 2.0 Style - Unboxed) */}
                <div className="md:col-span-7 flex flex-col gap-8">
                    {/* Fiber Composition */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-forest/5 flex items-center justify-center">
                                    <Star weight="bold" className="w-4 h-4 text-forest" />
                                </div>
                                <span className="font-sans text-sm font-bold text-charcoal tracking-tight">Fiber Composition</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-charcoal/40 tabular-nums">
                                {features.fiber.points} <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">pts</span>
                            </span>
                        </div>
                        <div className="w-full h-2 bg-forest-light/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, features.fiber.value * 100)}%` }}
                                transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-forest shadow-[0_0_10px_rgba(92,108,71,0.2)]"
                            />
                        </div>
                         {isExtensionMode && extensionData.fiberComposition ? (
                            <p className="font-mono text-[9px] text-charcoal/50 leading-relaxed max-w-[45ch]">
                                {extensionData.fiberComposition}
                            </p>
                        ) : (
                            <p className="font-mono text-[9px] text-charcoal/30 leading-relaxed">
                                {isExtensionMode ? "Fiber details not found." : "Install extension for precise fiber analysis."}
                            </p>
                        )}
                    </div>

                    {/* Brand Reputation */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center">
                                    <Leaf weight="bold" className="w-4 h-4 text-sage" />
                                </div>
                                <span className="font-sans text-sm font-bold text-charcoal tracking-tight">Brand Reputation</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-charcoal/40 tabular-nums">
                                {features.brand.points} <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">pts</span>
                            </span>
                        </div>
                        <div className="w-full h-2 bg-sage/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, features.brand.value * 100)}%` }}
                                transition={{ delay: 1.3, duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-sage shadow-[0_0_10px_rgba(159,165,134,0.2)]"
                            />
                        </div>
                        {isExtensionMode && (extensionData.brandRatingSources || extensionData.brand) ? (
                            <p className="font-mono text-[9px] text-charcoal/50 leading-relaxed max-w-[45ch]">
                                {extensionData.brandRatingSources || `Brand: ${extensionData.brand}`}
                            </p>
                        ) : brandInfo?.found ? (
                            <p className="font-mono text-[9px] text-charcoal/50 leading-relaxed">
                                {brandInfo.name} {brandInfo.good_on_you ? `(Good On You: ${brandInfo.good_on_you})` : ""}
                            </p>
                        ) : (
                            <p className="font-mono text-[9px] text-charcoal/30 leading-relaxed">
                                No specific brand data found for this query.
                            </p>
                        )}
                    </div>

                    {/* Trend Longevity */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-pink-muted/30 flex items-center justify-center">
                                    <ChartLine weight="bold" className="w-4 h-4 text-pink-dark" />
                                </div>
                                <span className="font-sans text-sm font-bold text-charcoal tracking-tight">Trend Longevity</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-charcoal/40 tabular-nums">
                                {features.trend.points} <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 ml-1">pts</span>
                            </span>
                        </div>
                        <div className="w-full h-2 bg-pink-muted/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, features.trend.value * 100)}%` }}
                                transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-pink-dark shadow-[0_0_10px_rgba(168,118,137,0.2)]"
                            />
                        </div>
                        <p className="font-mono text-[9px] text-charcoal/50 leading-relaxed">
                            {effectiveTrendLabel} • Projected remaining: ~{weeksRemaining ?? extensionData?.trendLifespanWeeks ?? 0} weeks
                        </p>
                    </div>
                </div>
            </div>

            {/* Health & Durability Footer Info */}
            {isExtensionMode && (
                <div className="mt-12 pt-8 border-t border-forest/5 flex flex-wrap items-center gap-6">
                    {(() => {
                        const health = getHealthIcon(extensionData.healthLabel);
                        return (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: health.bg }}>
                                <Heartbeat weight="bold" className="w-4 h-4" style={{ color: health.color }} />
                                <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: health.color }}>
                                    {extensionData.healthLabel} Materials
                                </span>
                            </div>
                        );
                    })()}
                    
                    {extensionData.fiberDurabilityWears > 0 && (
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-forest/20" />
                            <span className="font-sans text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">
                                Est. {extensionData.fiberDurabilityWears} wears durability
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                        <Info weight="bold" className="w-3.5 h-3.5 text-charcoal/20" />
                        <span className="font-sans text-[10px] font-bold text-charcoal/20 uppercase tracking-widest">
                            Verified by Unravel ML
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});
