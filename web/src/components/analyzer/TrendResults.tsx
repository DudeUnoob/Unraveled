"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { TrendAnalysisResponse } from "@/types/analysis";
import { TrendLifespanBar } from "./TrendLifespanBar";
import { DecayCurveChart } from "./DecayCurveChart";
import { TrendUp, Clock, ChartLine } from "@phosphor-icons/react";

interface TrendResultsProps {
    data: TrendAnalysisResponse;
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

export const TrendResults = memo(function TrendResults({ data }: TrendResultsProps) {
    const phaseColor = getPhaseColor(data.trend_lifespan.label);
    const verdict = getPhaseVerdict(
        data.trend_lifespan.label,
        data.trend_lifespan.weeks_remaining
    );

    return (
        <div className="w-full">
            {/* Verdict Banner */}
            <motion.div
                custom={0}
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

            {/* Trend Lifespan Bar */}
            <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="mb-10 pb-10 border-b border-charcoal/[0.06]"
            >
                <TrendLifespanBar lifespan={data.trend_lifespan} />
            </motion.div>

            {/* Decay Curve Chart */}
            <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="mb-10 pb-10 border-b border-charcoal/[0.06]"
            >
                <DecayCurveChart curve={data.trend_curve} phaseColor={phaseColor} />
            </motion.div>

            {/* Model Details */}
            <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
            >
                <h3 className="font-sans text-sm font-semibold text-charcoal/60 uppercase tracking-widest mb-4">
                    Decay model parameters
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Peak (K)", value: data.decay_params.K.toFixed(0) },
                        { label: "Growth rate", value: data.decay_params.r.toFixed(3) },
                        { label: "Decay rate (\u03BB)", value: data.decay_params.lambda.toFixed(3) },
                        { label: "R\u00B2 fit", value: `${(data.decay_params.r_squared * 100).toFixed(1)}%` },
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
        </div>
    );
});
