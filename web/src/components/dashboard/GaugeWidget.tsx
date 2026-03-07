"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GAUGE_LABELS = ["TIMELESS", "CLASSIC", "TRENDING", "FADING", "DEAD"];

interface GaugeWidgetProps {
    score: number; // 0 to 100
    trendFeed: string;
}

export const GaugeWidget = memo(function GaugeWidget({ score, trendFeed }: GaugeWidgetProps) {
    // Map score (0-100) to rotation (-90 to 90)
    // 100 score (Timeless) = -90 (far left)
    // 0 score (Dead) = 90 (far right)
    const rotation = -90 + ((100 - score) / 100) * 180;

    return (
        <div className="flex flex-col h-full bg-transparent pt-8 pb-4">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-6 mb-8">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rust opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rust"></span>
                </div>
                <span className="font-mono text-[10px] sm:text-xs text-charcoal/60 font-semibold tracking-widest uppercase">
                    Live Trend Feed
                </span>
            </div>

            {/* Semicircular Arc Gauge */}
            <div className="relative w-full px-6 md:px-10 aspect-[2/1] overflow-hidden flex flex-col items-center justify-end">
                <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--color-forest)" />
                            <stop offset="50%" stopColor="var(--color-sage)" />
                            <stop offset="100%" stopColor="var(--color-rust)" />
                        </linearGradient>
                    </defs>

                    {/* Background Track */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="var(--color-linen)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Foreground Colored Arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Needle Center Dot */}
                    <circle cx="100" cy="100" r="6" fill="var(--color-charcoal)" />

                    {/* Animated Needle */}
                    <motion.g
                        animate={{ rotate: rotation }}
                        transition={{
                            type: "spring",
                            stiffness: 60,
                            damping: 15,
                        }}
                        style={{ originX: "100px", originY: "100px" }}
                    >
                        {/* Needle Line */}
                        <line x1="100" y1="100" x2="100" y2="30" stroke="var(--color-charcoal)" strokeWidth="3" strokeLinecap="round" />
                        {/* Point dot */}
                        <circle cx="100" cy="24" r="3" fill="var(--color-charcoal)" />
                    </motion.g>
                </svg>

                {/* Labels under arc */}
                <div className="absolute bottom-0 w-full flex justify-between px-6 md:px-10 text-charcoal/50">
                    <span className="font-mono text-[9px] tracking-wide uppercase">Timeless</span>
                    <span className="font-mono text-[9px] tracking-wide uppercase">Dead</span>
                </div>
            </div>

            <div className="w-full px-6 md:px-10 mt-2 flex justify-between text-charcoal/40 mb-6">
                {GAUGE_LABELS.slice(1, -1).map((lbl) => (
                    <span key={lbl} className="font-mono text-[8px] tracking-widest uppercase">
                        {lbl}
                    </span>
                ))}
            </div>

            {/* Typewriter text feed */}
            <div className="mt-auto px-6 font-mono text-xs text-charcoal h-10 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={trendFeed}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-x-6 top-0"
                    >
                        {trendFeed}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
});
