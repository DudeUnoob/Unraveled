"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { TrendAnalysisResponse, ExtensionData, CpwData } from "@/types/analysis";
import { TrendLifespanBar } from "./TrendLifespanBar";
import { DecayCurveChart } from "./DecayCurveChart";
import { CpwProjection } from "./CpwProjection";
import { ComparisonCallout } from "./ComparisonCallout";
import { SustainabilityScore } from "./SustainabilityScore";
import { ExtensionDataBanner } from "./ExtensionDataBanner";
import { TrendUp, Clock, ChartLine, ShareNetwork, PuzzlePiece, LinkSimple, Check } from "@phosphor-icons/react";
import { useState } from "react";

interface TrendResultsProps {
    data: TrendAnalysisResponse;
    extensionData?: ExtensionData | null;
    price?: number;
}

function getPhaseColor(label: string): string {
    switch (label) {
        case "Timeless": return "#2C4A3E";
        case "Trending": return "#7A9E8E";
        case "Fading": return "#D4883C";
        case "Dead": return "#C84B31";
        default: return "#7A9E8E";
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

// PRD §6.4: CPW = price / min(standard_wears, wears_before_trend_death)
// wears_before_trend_death = wears_per_week × weeks_remaining
const WEARS_PER_WEEK = 2;       // PRD default assumption
const STANDARD_WEARS = 60;      // fiber durability estimate (PRD example)

function computeWears(weeksRemaining: number, trendLabel: string): { standard: number; adjusted: number } {
    const wearsBeforeDeath = WEARS_PER_WEEK * weeksRemaining;
    const adjusted = trendLabel === "Timeless"
        ? STANDARD_WEARS                                    // no penalty for timeless
        : Math.min(STANDARD_WEARS, Math.max(1, wearsBeforeDeath)); // capped by trend lifespan
    return {
        standard: STANDARD_WEARS,
        adjusted,
    };
}

const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.15,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    }),
};

export const TrendResults = memo(function TrendResults({
    data,
    extensionData,
    price,
}: TrendResultsProps) {
    const phaseColor = getPhaseColor(data.trend_lifespan.label);
    const verdict = getPhaseVerdict(
        data.trend_lifespan.label,
        data.trend_lifespan.weeks_remaining
    );
    const [copied, setCopied] = useState(false);

    // Build CPW data if price is available
    const effectivePrice = price ?? extensionData?.price ?? null;
    let cpwData: CpwData | null = null;

    if (effectivePrice && effectivePrice > 0) {
        const wears = computeWears(data.trend_lifespan.weeks_remaining, data.trend_lifespan.label);

        // Use extension CPW if available, otherwise compute
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

    const handleCopyLink = async () => {
        const url = data.shareable_url || window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    let sectionIndex = 0;

    return (
        <div className="w-full">
            {/* Extension Banner */}
            {extensionData && (
                <motion.div
                    custom={sectionIndex++}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                >
                    <ExtensionDataBanner extensionData={extensionData} />
                </motion.div>
            )}

            {/* Verdict Banner */}
            <motion.div
                custom={sectionIndex++}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="mb-10 pb-8 border-b border-charcoal/[0.06]"
            >
                <div className="flex items-start gap-4">
                    <div
                        className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${phaseColor}15` }}
                    >
                        {data.trend_lifespan.label === "Timeless" ? (
                            <Clock weight="duotone" className="w-6 h-6" style={{ color: phaseColor }} />
                        ) : data.trend_lifespan.label === "Dead" ? (
                            <TrendUp weight="duotone" className="w-6 h-6 rotate-180" style={{ color: phaseColor }} />
                        ) : (
                            <ChartLine weight="duotone" className="w-6 h-6" style={{ color: phaseColor }} />
                        )}
                    </div>
                    <div>
                        <h2 className="font-sans text-xl font-semibold text-charcoal mb-1 tracking-tight">
                            <span className="capitalize">{data.query_normalized}</span>
                            <span className="mx-2 text-charcoal/20">/</span>
                            <span style={{ color: phaseColor }}>{data.trend_lifespan.label}</span>
                        </h2>
                        <p className="font-sans text-sm text-charcoal/50 leading-relaxed max-w-lg">
                            {verdict}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* W-1.5: Trend Lifespan Bar */}
            <motion.div
                custom={sectionIndex++}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="mb-10 pb-10 border-b border-charcoal/[0.06]"
            >
                <TrendLifespanBar lifespan={data.trend_lifespan} />
            </motion.div>

            {/* W-1.8: Decay Curve Chart */}
            <motion.div
                custom={sectionIndex++}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="mb-10 pb-10 border-b border-charcoal/[0.06]"
            >
                <DecayCurveChart curve={data.trend_curve} phaseColor={phaseColor} />
            </motion.div>

            {/* W-1.6: CPW Projection */}
            {cpwData && (
                <motion.div
                    custom={sectionIndex++}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="mb-10 pb-10 border-b border-charcoal/[0.06]"
                >
                    <CpwProjection cpw={cpwData} />
                </motion.div>
            )}

            {/* W-1.7: Comparison Callout */}
            {cpwData && (
                <motion.div
                    custom={sectionIndex++}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="mb-10 pb-10 border-b border-charcoal/[0.06]"
                >
                    <ComparisonCallout cpw={cpwData} query={data.query_normalized} />
                </motion.div>
            )}

            {/* W-1.10: Sustainability Score Display */}
            {extensionData && extensionData.sustainabilityScore > 0 && (
                <motion.div
                    custom={sectionIndex++}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="mb-10 pb-10 border-b border-charcoal/[0.06]"
                >
                    <SustainabilityScore extensionData={extensionData} />
                </motion.div>
            )}

            {/* Model Details */}
            <motion.div
                custom={sectionIndex++}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="mb-10 pb-10 border-b border-charcoal/[0.06]"
            >
                <h3 className="font-sans text-sm font-semibold text-charcoal/60 uppercase tracking-widest mb-4">
                    Decay model parameters
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Peak (K)", value: data.decay_params.K.toFixed(0) },
                        { label: "Growth rate", value: data.decay_params.r.toFixed(3) },
                        { label: "Decay rate (λ)", value: data.decay_params.lambda.toFixed(3) },
                        { label: "R² fit", value: `${(data.decay_params.r_squared * 100).toFixed(1)}%` },
                    ].map((param) => (
                        <div key={param.label}>
                            <span className="block font-mono text-[10px] text-charcoal/35 uppercase tracking-wider mb-1">
                                {param.label}
                            </span>
                            <span className="font-mono text-base font-semibold text-charcoal tabular-nums">
                                {param.value}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Share + CTA */}
            <motion.div
                custom={sectionIndex++}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="flex flex-col sm:flex-row items-center gap-3"
            >
                <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-cream rounded-xl font-sans text-sm font-medium hover:bg-forest transition-colors"
                >
                    {copied ? (
                        <>
                            <Check weight="bold" className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <ShareNetwork weight="bold" className="w-4 h-4" />
                            Share this analysis
                        </>
                    )}
                </button>

                {!extensionData && (
                    <a
                        href="https://chromewebstore.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 border border-charcoal/10 text-charcoal/60 rounded-xl font-sans text-sm font-medium hover:border-charcoal/25 hover:text-charcoal transition-colors"
                    >
                        <PuzzlePiece weight="duotone" className="w-4 h-4" />
                        Get the Chrome Extension
                    </a>
                )}

                {data.shareable_url && (
                    <a
                        href={data.shareable_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 border border-charcoal/10 text-charcoal/60 rounded-xl font-sans text-sm font-medium hover:border-charcoal/25 hover:text-charcoal transition-colors"
                    >
                        <LinkSimple weight="duotone" className="w-4 h-4" />
                        Permalink
                    </a>
                )}
            </motion.div>
        </div>
    );
});
