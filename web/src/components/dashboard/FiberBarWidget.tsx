"use client";

import { useEffect, useState, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type GarmentData = {
    name: string;
    score: number;
    fibers: { name: string; percent: number; color: string }[];
};

interface FiberBarWidgetProps {
    garment: GarmentData;
}

export const FiberBarWidget = memo(function FiberBarWidget({ garment }: FiberBarWidgetProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    // Score counter animation
    useEffect(() => {
        let startTimestamp: number;
        const duration = 1000;
        const startValue = animatedScore;
        const endValue = garment.score;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutExpo
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setAnimatedScore(Math.floor(startValue + ease * (endValue - startValue)));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [garment.score]);

    // Interpolate score color (Rust for low, Forest for high)
    const scoreColor = garment.score < 40 ? "text-rust" : garment.score < 70 ? "text-sage" : "text-forest";

    return (
        <div className="flex flex-col h-full bg-transparent pt-8 pb-8 px-6 md:px-10">

            {/* Garment Label Crossfade */}
            <div className="h-8 relative mb-6">
                <AnimatePresence mode="wait">
                    <motion.h3
                        key={garment.name}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 font-sans font-medium text-lg text-charcoal"
                    >
                        {garment.name}
                    </motion.h3>
                </AnimatePresence>
            </div>

            {/* Fiber Stack Bar */}
            <div className="w-full h-8 flex rounded-sm overflow-hidden mb-8 bg-linen/50 relative">
                <AnimatePresence mode="popLayout">
                    {garment.fibers.map((fiber, i) => (
                        <motion.div
                            key={`${garment.name}-${fiber.name}`} // Force recreate on new garment
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: `${fiber.percent}%`, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 90,
                                damping: 15,
                                delay: i * 0.05
                            }}
                            className={cn("h-full relative group cursor-crosshair border-r border-[#f6f5f1] last:border-r-0", fiber.color)}
                        >
                            {/* Custom Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-cream text-[10px] font-mono px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                {fiber.percent}% {fiber.name}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Score Output */}
            <div className="mt-auto">
                <p className="font-mono text-xs text-charcoal/50 uppercase tracking-widest mb-1">
                    Fiber Score
                </p>
                <div className="flex items-baseline gap-2">
                    <span className={cn("font-mono text-5xl md:text-6xl font-light tracking-tighter transition-colors duration-500", scoreColor)}>
                        {animatedScore}
                    </span>
                    <span className="font-mono text-xl text-charcoal/30">/100</span>
                </div>
            </div>

        </div>
    );
});
