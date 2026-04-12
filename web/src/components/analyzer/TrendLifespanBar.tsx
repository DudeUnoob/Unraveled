"use client";
import { memo } from "react";
import { motion } from "framer-motion";
import type { TrendLifespan } from "@/types/analysis";

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
//     const phaseColor = getPhaseColor(lifespan.label);
    return (
        <div className="w-full flex flex-col h-full gap-8">
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#5c6c47]">
                Trend Life Span
            </h3>
            {/* Premium Progress Track */}
            <div className="relative w-full h-6 flex items-center mt-4">
                {/* Background Track */}
                <div className="absolute w-full h-full bg-[#e2e3dc] rounded-full overflow-hidden" />
                
                {/* Animated fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${position}%` }}
                    transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.2 }}
                    className="absolute h-full rounded-full overflow-hidden bg-[#e6cfd8]"
                />
                {/* "You are here" indicator - Magnetic feeling */}
                <motion.div
                    initial={{ left: "0%", scale: 0 }}
                    animate={{ left: `${position}%`, scale: 1 }}
                    transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.6 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                >
                    <div className="relative">
                        <div className="w-6 h-6 rounded-full bg-[#d494ac] shadow-sm flex items-center justify-center border-2 border-white">
                             <div className="w-2 h-2 rounded-full bg-white opacity-50" />
                        </div>
                    </div>
                </motion.div>
            </div>
            {/* Stats Grid - Horizontal Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                <div className="flex flex-col gap-1">
                    <span className="font-serif text-sm font-medium text-[#5c6c47]/60">
                        Peaked
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="font-serif text-2xl font-bold text-[#5c6c47]">
                            {lifespan.peaked_weeks_ago}w ago
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="font-serif text-sm font-medium text-[#5c6c47]/60">
                        Remaining
                    </span>
                    <div className="flex items-baseline gap-2">
                        <motion.span 
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="font-serif text-2xl font-bold text-[#5c6c47]"
                        >
                            {lifespan.weeks_remaining}w
                        </motion.span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="font-serif text-sm font-medium text-[#5c6c47]/60">
                        Confidence
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="font-serif text-2xl font-bold text-[#5c6c47]">
                            {Math.round(lifespan.confidence * 100)}%
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="font-serif text-sm font-medium text-[#5c6c47]/60">
                        Velocity
                    </span>
                    <div className="flex items-baseline gap-2">
                         <span 
                            className="font-serif text-2xl font-bold" 
                            style={{ color: lifespan.velocity > 0 ? '#5c6c47' : lifespan.velocity < -2 ? '#C84B31' : '#5c6c47' }}
                        >
                            {lifespan.velocity > 0 ? '+' : ''}{lifespan.velocity.toFixed(1)}/wk
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});