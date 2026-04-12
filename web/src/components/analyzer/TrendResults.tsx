"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { TrendAnalysisResponse, ExtensionData, CpwData } from "@/types/analysis";
import { TrendLifespanBar } from "./TrendLifespanBar";
import { DecayCurveChart } from "./DecayCurveChart";
import { ShareButton } from "./ShareButton";
import { AlternativesSection } from "./AlternativesSection";
import { ExtensionDataBanner } from "./ExtensionDataBanner";
import { CpwProjection } from "./CpwProjection";
import { ComparisonCallout } from "./ComparisonCallout";
import { SustainabilityScore } from "./SustainabilityScore";
import { TrendUp, Clock, ChartLine, BookmarkSimple, Info } from "@phosphor-icons/react";
import { useUser } from "@/hooks/useUser";
import { useSavedAnalyses } from "@/hooks/useSavedAnalyses";
import { getStandardWears, DEFAULT_WEARS_PER_WEEK } from "@/lib/durability";

interface TrendResultsProps {
    data: TrendAnalysisResponse;
    extensionData?: ExtensionData | null;
    price?: number;
    wearsPerWeek?: number;
}

function getPhaseColor(label: string): string {
    switch (label) {
        case "Timeless": return "#2C4A3E";
        case "Trending": return "#5c6c47";
        case "Fading": return "#C84B31";
        case "Dead": return "#1C1C1C";
        default: return "#5c6c47";
    }
}

function getPhaseVerdict(label: string, weeksRemaining: number): string {
    switch (label) {
        case "Timeless":
            return "This style has shown consistent, stable interest for over a year. Buy with confidence.";
        case "Trending":
            return `Currently growing or near peak interest. Approximately ${weeksRemaining} weeks of strong relevance projected.`;
        case "Fading":
            return `This trend peaked and is declining. Roughly ${weeksRemaining} weeks of relevance remain before it feels dated.`;
        case "Dead":
            return "Interest has collapsed below viability. You may get very few wears before this feels obsolete.";
        default:
            return "Trend analysis complete.";
    }
}

function computeWears(
    weeksRemaining: number,
    trendLabel: string,
    standardWears: number,
    wearsPerWeek: number,
): { standard: number; adjusted: number } {
    const wearsBeforeDeath = wearsPerWeek * weeksRemaining;
    const adjusted = trendLabel === "Timeless"
        ? standardWears
        : Math.min(standardWears, Math.max(1, wearsBeforeDeath));
    return {
        standard: standardWears,
        adjusted,
    };
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as const
        }
    }
};

export const TrendResults = memo(function TrendResults({
    data,
    extensionData,
    price,
    wearsPerWeek: wearsPerWeekProp,
}: TrendResultsProps) {
    const phaseColor = getPhaseColor(data.trend_lifespan.label);
    const verdict = getPhaseVerdict(
        data.trend_lifespan.label,
        data.trend_lifespan.weeks_remaining
    );
    const isFallback = data.trend_curve.model_type === "keyword_fallback"
        || !data.data_sources.google_trends.available;

    const effectivePrice = price ?? extensionData?.price ?? null;
    const effectiveWearsPerWeek = wearsPerWeekProp ?? DEFAULT_WEARS_PER_WEEK;
    const smartStandardWears = extensionData?.fiberDurabilityWears && extensionData.fiberDurabilityWears > 0
        ? extensionData.fiberDurabilityWears
        : getStandardWears(data.query_normalized);
    
    let cpwData: CpwData | null = null;
    if (effectivePrice && effectivePrice > 0) {
        const wears = computeWears(data.trend_lifespan.weeks_remaining, data.trend_lifespan.label, smartStandardWears, effectiveWearsPerWeek);
        if (extensionData?.cpw && extensionData.cpw > 0) {
            cpwData = {
                price: effectivePrice,
                currency: extensionData.currency || "USD",
                standardCpw: extensionData.cpw,
                standardWears: wears.standard,
                trendAdjustedCpw: extensionData.cpwAdjusted || extensionData.cpw,
                trendAdjustedWears: wears.adjusted,
                trendLabel: data.trend_lifespan.label,
            };
        } else {
            cpwData = {
                price: effectivePrice,
                currency: extensionData?.currency || "USD",
                standardCpw: Math.round((effectivePrice / wears.standard) * 100) / 100,
                standardWears: wears.standard,
                trendAdjustedCpw: Math.round((effectivePrice / wears.adjusted) * 100) / 100,
                trendAdjustedWears: wears.adjusted,
                trendLabel: data.trend_lifespan.label,
            };
        }
    }

    const { user } = useUser();
    const { isSaved, save, unsave } = useSavedAnalyses();
    const bookmarked = isSaved(data.analysis_id);

    const handleBookmark = async () => {
        if (bookmarked) {
            await unsave(data.analysis_id);
        } else {
            await save(data.analysis_id, data.query_normalized, data.trend_lifespan.label);
        }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full flex flex-col gap-12"
        >
            {/* Header / Verdict Section */}
            <motion.div variants={itemVariants} className="w-full flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-forest/5">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                         <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${phaseColor}10` }}
                        >
                            {data.trend_lifespan.label === "Timeless" ? (
                                <Clock weight="duotone" className="w-5 h-5" style={{ color: phaseColor }} />
                            ) : data.trend_lifespan.label === "Dead" ? (
                                <TrendUp weight="duotone" className="w-5 h-5 rotate-180" style={{ color: phaseColor }} />
                            ) : (
                                <ChartLine weight="duotone" className="w-5 h-5" style={{ color: phaseColor }} />
                            )}
                        </div>
                        <span className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em]">Analysis Verdict</span>
                    </div>
                    <h2 className="font-sans text-4xl md:text-5xl font-bold text-charcoal tracking-tighter mb-4">
                        <span className="capitalize">{data.query_normalized}</span>
                        <span className="mx-4 text-forest-light">/</span>
                        <span style={{ color: phaseColor }} className="font-drama italic font-normal">{data.trend_lifespan.label}</span>
                    </h2>
                    <p className="font-sans text-lg text-charcoal/60 leading-relaxed max-w-2xl">
                        {verdict}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                     {user && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBookmark}
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-forest-light/20 text-forest font-sans text-xs font-bold transition-colors hover:bg-forest-light/40"
                        >
                            <BookmarkSimple weight={bookmarked ? "fill" : "bold"} className="w-4 h-4" />
                            {bookmarked ? "Saved" : "Save Analysis"}
                        </motion.button>
                    )}
                    <ShareButton shareableUrl={data.shareable_url} />
                </div>
            </motion.div>

            {/* Extension Data Banner (If active) */}
            {extensionData && (
                <motion.div variants={itemVariants}>
                    <ExtensionDataBanner extensionData={extensionData} />
                </motion.div>
            )}

            {/* Warning Callout */}
            {isFallback && (
                <motion.div
                    variants={itemVariants}
                    className="flex items-start gap-4 p-6 rounded-[1.5rem] bg-rust/5 border border-rust/10"
                >
                    <Info weight="fill" className="w-6 h-6 text-rust shrink-0 mt-0.5" />
                    <p className="font-sans text-sm text-rust/80 leading-relaxed">
                        {data.data_sources.google_trends.serp_key_configured === false
                            ? "Real-time trend data unavailable. Metrics below are keyword-based estimates, not derived from Google Trends."
                            : "Google Trends has insufficient data for this specific query. Metrics below are keyword-based estimates — try a broader search term for live analysis."}
                    </p>
                </motion.div>
            )}

            {/* Bento Grid Row 1: Main Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                 {/* Sustainability Score (Main Bento Card) */}
                <motion.div variants={itemVariants} className="lg:col-span-7 bg-white/40 backdrop-blur-sm border border-forest/5 rounded-[2.5rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] flex flex-col">
                    <SustainabilityScore
                        extensionData={extensionData}
                        trendLabel={data.trend_lifespan.label}
                        weeksRemaining={data.trend_lifespan.weeks_remaining}
                        brandInfo={data.brand_info}
                    />
                </motion.div>

                {/* Trend Lifespan Stats (Side Bento Card) */}
                <motion.div variants={itemVariants} className="lg:col-span-5 bg-white/40 backdrop-blur-sm border border-forest/5 rounded-[2.5rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden">
                    <TrendLifespanBar lifespan={data.trend_lifespan} />
                </motion.div>
            </div>

            {/* Bento Grid Row 2: Decay & CPW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Decay Curve Chart (Wide Bento Card) */}
                <motion.div variants={itemVariants} className="lg:col-span-8 bg-white/40 backdrop-blur-sm border border-forest/5 rounded-[2.5rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)]">
                    <DecayCurveChart curve={data.trend_curve} phaseColor={phaseColor} data_sources={data.data_sources} />
                </motion.div>

                {/* CPW Projection (Compact Bento Card) */}
                {cpwData && (
                    <motion.div variants={itemVariants} className="lg:col-span-4 bg-white/40 backdrop-blur-sm border border-forest/5 rounded-[2.5rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] flex flex-col">
                        <CpwProjection cpw={cpwData} />
                    </motion.div>
                )}
            </div>

            {/* Comparison Callout (Full Width Bento Card) */}
            {cpwData && (
                <motion.div variants={itemVariants} className="w-full bg-forest text-cream rounded-[2.5rem] p-10 overflow-hidden relative">
                    <ComparisonCallout cpw={cpwData} query={data.query_normalized} />
                    
                    {/* Decorative refraction pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)]" />
                </motion.div>
            )}

            {/* Model Parameters (Monospace cockpit mode) */}
            <motion.div variants={itemVariants} className="w-full pt-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-px bg-forest/20" />
                    <h3 className="font-sans text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em]">
                        Decay Model Parameters
                    </h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { label: "Peak Interest (K)", value: data.decay_params.K.toFixed(0) },
                        { label: "Growth Rate (r)", value: isFallback ? "—" : data.decay_params.r.toFixed(3) },
                        { label: "Decay Constant (λ)", value: isFallback ? "—" : data.decay_params.lambda.toFixed(3) },
                        { label: "Statistical Fit (R²)", value: isFallback ? "N/A" : `${(data.decay_params.r_squared * 100).toFixed(1)}%` },
                    ].map((param) => (
                        <div key={param.label} className="group">
                            <span className="block font-sans text-[10px] font-bold text-charcoal/25 uppercase tracking-widest mb-3 group-hover:text-forest transition-colors duration-300">
                                {param.label}
                            </span>
                            <span className="font-mono text-2xl font-medium text-charcoal/80 tabular-nums">
                                {param.value}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Sustainable Alternatives (Full Width) */}
            <motion.div variants={itemVariants} className="w-full mt-12 pt-12 border-t border-forest/5">
                <AlternativesSection
                    query={data.query_normalized}
                    trendLabel={data.trend_lifespan.label}
                />
            </motion.div>
        </motion.div>
    );
});
