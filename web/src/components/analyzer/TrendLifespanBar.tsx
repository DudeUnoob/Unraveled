"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { TrendLifespan } from "@/types/analysis";

const PHASES = [
    { label: "Timeless", color: "#5c6c47", position: 12 },
    { label: "Trending", color: "#9fa586", position: 40 },
    { label: "Fading", color: "#C84B31", position: 68 },
    { label: "Dead", color: "#1C1C1C", position: 92 },
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
        case "Timeless": return "#5c6c47";
        case "Trending": return "#9fa586";
        case "Fading": return "#C84B31";
        case "Dead": return "#1C1C1C";
        default: return "#9fa586";
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
        <div className="w-full flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-1">
                    <h3 className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em]">
                        Trend Life Cycle
                    </h3>
                    <p className="font-sans text-xs text-charcoal/40 font-medium">
                        Projected relevance based on decay velocity.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-forest-light/10 border border-forest/5">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: phaseColor }} />
                    <span className="font-mono text-[10px] font-bold text-charcoal/60 uppercase tracking-widest">
                        {lifespan.label} Phase
                    </span>
                </div>
            </div>

            {/* Premium Progress Track */}
            <div className="relative w-full h-16 flex items-center mb-12">
                {/* Background Track */}
                <div className="absolute w-full h-1 bg-charcoal/[0.03] rounded-full" />
                
                {/* Animated fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${position}%` }}
                    transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.2 }}
                    className="absolute h-1 rounded-full overflow-hidden"
                >
                    <div 
                        className="w-[1000px] h-full" 
                        style={{ background: `linear-gradient(90deg, #5c6c47 0%, #9fa586 40%, #D4883C 70%, #C84B31 100%)` }} 
                    />
                </motion.div>

                {/* Phase Markers */}
                {PHASES.map((phase) => (
                    <div 
                        key={phase.label} 
                        className="absolute flex flex-col items-center gap-2" 
                        style={{ left: `${phase.position}%`, transform: 'translateX(-50%)' }}
                    >
                        <div className={`w-1 h-1 rounded-full ${phase.label === lifespan.label ? 'bg-charcoal scale-150' : 'bg-charcoal/10'}`} />
                        <span className={`font-mono text-[9px] uppercase tracking-tighter transition-all duration-500 ${phase.label === lifespan.label ? 'text-charcoal font-bold opacity-100 scale-110' : 'text-charcoal/20 opacity-40'}`}>
                            {phase.label}
                        </span>
                    </div>
                ))}

                {/* "You are here" indicator - Magnetic feeling */}
                <motion.div
                    initial={{ left: "0%", scale: 0 }}
                    animate={{ left: `${position}%`, scale: 1 }}
                    transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.6 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                >
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center border border-forest/5">
                             <div
                                className="w-4 h-4 rounded-full shadow-inner"
                                style={{ backgroundColor: phaseColor }}
                            />
                        </div>
                        {/* Status Float Label */}
                         <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-charcoal text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg"
                        >
                            {lifespan.score}/100 Score
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-charcoal rotate-45" />
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Stats Grid - Cockpit Mode */}
            <div className="mt-auto grid grid-cols-2 gap-8 pt-10 border-t border-forest/5">
                <div className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-bold text-charcoal/25 uppercase tracking-widest">
                        Peaked Interest
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="font-mono text-3xl font-medium text-charcoal tabular-nums tracking-tighter">
                            {lifespan.peaked_weeks_ago}
                        </span>
                        <span className="font-sans text-xs font-bold text-charcoal/40 uppercase">weeks ago</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-bold text-charcoal/25 uppercase tracking-widest">
                        Projected Life
                    </span>
                    <div className="flex items-baseline gap-2">
                        <motion.span 
                            animate={{ opacity: [1, 0.6, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="font-mono text-3xl font-medium text-forest tabular-nums tracking-tighter"
                        >
                            {lifespan.weeks_remaining}
                        </motion.span>
                        <span className="font-sans text-xs font-bold text-charcoal/40 uppercase">weeks left</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-bold text-charcoal/25 uppercase tracking-widest">
                        Model Confidence
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="font-mono text-3xl font-medium text-charcoal tabular-nums tracking-tighter">
                            {Math.round(lifespan.confidence * 100)}
                        </span>
                        <span className="font-sans text-xs font-bold text-charcoal/40 uppercase">% precision</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-bold text-charcoal/25 uppercase tracking-widest">
                        Decay Velocity
                    </span>
                    <div className="flex items-baseline gap-2">
                         <span 
                            className="font-mono text-3xl font-medium tabular-nums tracking-tighter" 
                            style={{ color: lifespan.velocity > 0 ? '#5c6c47' : lifespan.velocity < -2 ? '#C84B31' : '#D4883C' }}
                        >
                            {lifespan.velocity > 0 ? '+' : ''}{lifespan.velocity.toFixed(1)}
                        </span>
                        <span className="font-sans text-xs font-bold text-charcoal/40 uppercase">pts / wk</span>
                    </div>
                </div>
            </div>
        </div>
    );
});
