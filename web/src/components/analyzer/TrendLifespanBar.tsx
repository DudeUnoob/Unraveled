"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { TrendLifespan } from "@/types/analysis";

const PHASES = [
    { label: "Timeless", color: "#2C4A3E", position: 0 },
    { label: "Trending", color: "#7A9E8E", position: 33 },
    { label: "Fading", color: "#D4883C", position: 66 },
    { label: "Dead", color: "#C84B31", position: 100 },
] as const;

function getPhasePosition(label: string): number {
    switch (label) {
        case "Timeless": return 12;
        case "Trending": return 40;
        case "Fading": return 68;
        case "Dead": return 92;
        default: return 50;
    }
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

interface TrendLifespanBarProps {
    lifespan: TrendLifespan;
}

export const TrendLifespanBar = memo(function TrendLifespanBar({
    lifespan,
}: TrendLifespanBarProps) {
    const position = getPhasePosition(lifespan.label);
    const phaseColor = getPhaseColor(lifespan.label);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-sans text-sm font-semibold text-charcoal/60 uppercase tracking-widest">
                    Trend Lifespan
                </h3>
                <div className="flex items-center gap-2">
                    <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: phaseColor }}
                    />
                    <span className="font-sans text-sm font-semibold text-charcoal">
                        {lifespan.label}
                    </span>
                    <span className="font-mono text-xs text-charcoal/40 tabular-nums">
                        · {lifespan.score}/100
                    </span>
                </div>
            </div>

            {/* Progress Track */}
            <div className="relative w-full h-2.5 bg-charcoal/[0.06] rounded-full overflow-visible">
                {/* Gradient fill up to position */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${position}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.2 }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                        background: `linear-gradient(90deg, #2C4A3E 0%, #7A9E8E 40%, #D4883C 70%, #C84B31 100%)`,
                    }}
                />

                {/* "You are here" indicator */}
                <motion.div
                    initial={{ left: "0%", scale: 0 }}
                    animate={{ left: `${position}%`, scale: 1 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.5 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                >
                    <div
                        className="w-5 h-5 rounded-full border-[3px] border-cream shadow-md"
                        style={{ backgroundColor: phaseColor }}
                    />
                </motion.div>
            </div>

            {/* Phase Labels */}
            <div className="flex justify-between mt-3">
                {PHASES.map((phase) => (
                    <span
                        key={phase.label}
                        className={`font-mono text-[10px] tracking-wider uppercase transition-opacity ${phase.label === lifespan.label
                            ? "text-charcoal font-semibold opacity-100"
                            : "text-charcoal/30 opacity-70"
                            }`}
                    >
                        {phase.label}
                    </span>
                ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-charcoal/[0.06]">
                <div>
                    <span className="block font-mono text-[10px] text-charcoal/40 uppercase tracking-wider mb-1">
                        Peaked
                    </span>
                    <span className="font-mono text-lg font-semibold text-charcoal tabular-nums">
                        {lifespan.peaked_weeks_ago}w ago
                    </span>
                </div>
                <div>
                    <span className="block font-mono text-[10px] text-charcoal/40 uppercase tracking-wider mb-1">
                        Remaining
                    </span>
                    <span className="font-mono text-lg font-semibold tabular-nums" style={{ color: phaseColor }}>
                        {lifespan.weeks_remaining}w
                    </span>
                </div>
                <div>
                    <span className="block font-mono text-[10px] text-charcoal/40 uppercase tracking-wider mb-1">
                        Confidence
                    </span>
                    <span className="font-mono text-lg font-semibold text-charcoal tabular-nums">
                        {Math.round(lifespan.confidence * 100)}%
                    </span>
                </div>
                <div>
                    <span className="block font-mono text-[10px] text-charcoal/40 uppercase tracking-wider mb-1">
                        Velocity
                    </span>
                    <span className="font-mono text-lg font-semibold tabular-nums" style={{ color: lifespan.velocity > 0 ? '#2C4A3E' : lifespan.velocity < -2 ? '#C84B31' : '#D4883C' }}>
                        {lifespan.velocity > 0 ? '↗' : lifespan.velocity < -1 ? '↘' : '→'}{' '}
                        {Math.abs(lifespan.velocity).toFixed(1)}/wk
                    </span>
                </div>
            </div>
        </div>
    );
});
