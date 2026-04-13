"use client";
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// const GAUGE_LABELS = ["TIMELESS", "CLASSIC", "TRENDING", "FADING", "DEAD"];
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
        <div className="flex flex-col h-full bg-transparent pt-8 pb-8">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-8 mb-8">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rust opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rust"></span>
                </div>
                <span className="font-mono text-[10px] text-charcoal/60 font-semibold tracking-[0.2em] uppercase">
                    Live Trend Feed
                </span>
            </div>
            {/* Semicircular Arc Gauge */}
            <div className="relative w-full px-2 lg:px-6 object-contain aspect-[2/1] overflow-visible mb-10 mt-2">
                <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4A6741" /> {/* Forest */}
                            <stop offset="50%" stopColor="#899A8B" /> {/* Sage */}
                            <stop offset="100%" stopColor="#C84B31" /> {/* Rust */}
                        </linearGradient>
                    </defs>
                    {/* Background Track */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#EAE8E3"
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
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * (100 - score)) / 100}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                    {/* Animated Needle Line */}
                    <motion.g
                        animate={{ rotate: rotation }}
                        transition={{
                            type: "spring",
                            stiffness: 60,
                            damping: 15,
                        }}
                        style={{ originX: "100px", originY: "100px" }}
                    >
                        <line x1="100" y1="100" x2="100" y2="25" stroke="#1C1C1C" strokeWidth="3" strokeLinecap="round" />
                    </motion.g>
                    {/* Center Dot (on top of line) */}
                    <circle cx="100" cy="100" r="6" fill="#1C1C1C" />
                    {/* SVG text labels that scale perfectly with the gauge */}
                    {/* Font size 9.5 is mathematically the largest size possible on 1 line for these 5 specific words */}
                    <g fill="#1C1C1C" opacity="0.4" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0" className="uppercase font-medium">
                        <text x="0" y="125" textAnchor="start">Timeless</text>
                        <text x="48.5" y="125" textAnchor="start">Classic</text>
                        <text x="91.5" y="125" textAnchor="start">Trending</text>
                        <text x="140" y="125" textAnchor="start">Fading</text>
                        <text x="200" y="125" textAnchor="end">Dead</text>
                    </g>
                </svg>
            </div>
            {/* Typewriter text feed */}
            <div className="px-8 font-mono text-[11px] md:text-xs text-charcoal leading-relaxed min-h-[64px] pb-3 relative">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={trendFeed}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-x-8 top-0 pr-4"
                    >
                        {trendFeed}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
});