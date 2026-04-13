"use client";
import { memo } from "react";
import { motion } from "framer-motion";
import type { BrandInfo, ExtensionData } from "@/types/analysis";
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
        <div className="w-full flex flex-col gap-8 md:flex-row md:items-center">
            {/* Score Title & Gauge (Left Side) */}
            <div className="w-full md:w-[35%] flex flex-col items-center md:items-start shrink-0">
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#5c6c47] mb-8">
                    Sustainability Score
                </h3>
                
                <div className="relative w-[220px] h-[220px] flex items-center justify-center">
                    <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                        {/* Background Track */}
                        <circle
                            cx="80" cy="80" r="70"
                            fill="none"
                            stroke="#e2e3dc"
                            strokeWidth="12"
                        />
                        {/* Progress Track */}
                        <motion.circle
                            cx="80" cy="80" r="70"
                            fill="none"
                            stroke={gradeColor}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: circumference - progress }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </svg>
                    
                    {/* Inner Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="font-serif text-6xl font-bold text-[#5c6c47] tracking-tighter mt-2">
                            {score}
                        </span>
                        <span className="font-sans text-sm font-semibold text-charcoal/60 mt-1">
                            {grade} - {gradeLabel}
                        </span>
                    </div>
                </div>
            </div>
            {/* Breakdown Bars (Right Side) */}
            <div className="w-full md:w-[65%] flex flex-col gap-10 mt-4 md:mt-16 md:pl-10">
                
                {/* Fiber Composition */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between w-full relative">
                        <span className="font-serif text-lg font-medium text-[#5c6c47]">Fiber Composition</span>
                    </div>
                    <div className="w-full h-4 bg-[#e2e3dc] rounded-full overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, features.fiber.value * 100)}%` }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="absolute top-0 left-0 h-full rounded-full bg-[#d6e2a9]"
                        />
                        {/* Indicator dot */}
                        <motion.div 
                            initial={{ left: 0, opacity: 0 }}
                            animate={{ left: `${Math.min(100, features.fiber.value * 100)}%`, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-[#798350] rounded-full border-2 border-white"
                        />
                    </div>
                </div>
                {/* Brand Reputation */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between w-full relative">
                        <span className="font-serif text-lg font-medium text-[#5c6c47]">Brand Reputation</span>
                    </div>
                    <div className="w-full h-4 bg-[#e2e3dc] rounded-full overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, features.brand.value * 100)}%` }}
                            transition={{ delay: 0.7, duration: 1 }}
                            className="absolute top-0 left-0 h-full rounded-full bg-[#d7eaff]"
                        />
                         {/* Indicator dot */}
                         <motion.div 
                            initial={{ left: 0, opacity: 0 }}
                            animate={{ left: `${Math.min(100, features.brand.value * 100)}%`, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 1 }}
                            className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-[#718ca9] rounded-full border-2 border-white"
                        />
                    </div>
                </div>
                {/* Trend Longevity */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between w-full relative">
                        <span className="font-serif text-lg font-medium text-[#5c6c47]">Trend Longevity</span>
                    </div>
                    <div className="w-full h-4 bg-[#e2e3dc] rounded-full overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, features.trend.value * 100)}%` }}
                            transition={{ delay: 0.9, duration: 1 }}
                            className="absolute top-0 left-0 h-full rounded-full bg-[#967f6e]"
                        />
                        {/* Indicator dot */}
                        <motion.div 
                            initial={{ left: 0, opacity: 0 }}
                            animate={{ left: `${Math.min(100, features.trend.value * 100)}%`, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 1 }}
                            className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-[#58483b] rounded-full border-2 border-white"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#9fa586] text-white border-2 border-[#5c6c47] font-serif text-lg font-semibold hover:bg-[#8f9576] transition-colors">
                        See More <span className="text-xl">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
});