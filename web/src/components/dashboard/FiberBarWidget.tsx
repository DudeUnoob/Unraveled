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

    // Interpolate score color (Rust for low, Sage for mid, Forest for high)
    const scoreColor = garment.score < 40 ? "text-[#C84B31]" : garment.score < 70 ? "text-[#899A8B]" : "text-[#4A6741]";

    return (
        <div className="flex flex-col h-full bg-transparent pt-8 pb-8 px-8 md:px-12">

            {/* Garment Label Crossfade */}
            <div className="h-8 relative mb-6">
                <AnimatePresence mode="wait">
                    <motion.h3
                        key={garment.name}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 font-sans font-medium text-[16px] text-charcoal"
                    >
                        {garment.name}
                    </motion.h3>
                </AnimatePresence>
            </div>

            {/* Fiber Stack Bar */}
            <div className="w-full h-8 flex rounded-[4px] overflow-hidden mb-8 bg-[#EAE8E3] relative">
                <AnimatePresence mode="popLayout">
                    {garment.fibers.map((fiber, i) => (
                        <motion.div
                            key={`${garment.name}-${fiber.name}`}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: `${fiber.percent}%`, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 90,
                                damping: 15,
                                delay: i * 0.05
                            }}
                            className={cn("h-full relative group cursor-crosshair border-r border-white/20 last:border-r-0", fiber.color)}
                        >
                            {/* Custom Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1C1C1C] text-[#F6F5F1] text-[10px] font-mono px-2 py-1 rounded-[2px] pointer-events-none whitespace-nowrap z-10 shadow-sm">
                                {fiber.percent}% {fiber.name}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Score Output */}
            <div className="mt-auto">
                <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-[0.2em] mb-2 font-semibold">
                    Fiber Score
                </p>
                <div className="flex items-baseline gap-2">
                    <span className={cn("font-mono text-[4rem] font-light leading-none tracking-tighter transition-colors duration-500", scoreColor)}>
                        {animatedScore}
                    </span>
                    <span className="font-mono text-xl text-charcoal/30 font-light">/100</span>
                </div>
            </div>

        </div>
    );
});
