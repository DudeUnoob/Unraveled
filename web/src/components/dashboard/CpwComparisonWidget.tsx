"use client";

import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Slot machine ticker for numbers
const NumberTicker = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTimestamp: number;
        const duration = 1200;
        const startValue = 0;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4); // quartOut
            setDisplayValue(startValue + ease * (value - startValue));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayValue(value);
            }
        };
        window.requestAnimationFrame(step);
    }, [value]);

    // Format decimals if needed
    const formatted = value % 1 !== 0
        ? displayValue.toFixed(2)
        : Math.floor(displayValue).toString();

    return (
        <span className="font-mono tabular-nums">
            {prefix}{formatted}{suffix}
        </span>
    );
};

interface CpwComparisonData {
    price: number;
    wears: number;
    cpw: number;
}

interface CpwComparisonWidgetProps {
    fastFashion?: CpwComparisonData;
    quality?: CpwComparisonData;
}

const EXAMPLE_FAST_FASHION: CpwComparisonData = { price: 89, wears: 16, cpw: 5.56 };
const EXAMPLE_QUALITY: CpwComparisonData = { price: 95, wears: 60, cpw: 1.58 };

export const CpwComparisonWidget = memo(function CpwComparisonWidget({
    fastFashion: fastFashionProp,
    quality: qualityProp,
}: CpwComparisonWidgetProps) {
    const [resolved, setResolved] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setResolved(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const isExample = !fastFashionProp || !qualityProp;
    const fastFashion = fastFashionProp ?? EXAMPLE_FAST_FASHION;
    const quality = qualityProp ?? EXAMPLE_QUALITY;
    const savings = (fastFashion.cpw - quality.cpw).toFixed(2);

    return (
        <div className="flex flex-col h-full bg-cream pt-8 pb-6 px-4 md:px-8 border-t border-linen/50 relative">

            {isExample && (
                <p className="text-[9px] font-mono uppercase tracking-wider text-charcoal/40 text-center mb-2">
                    Illustrative example
                </p>
            )}

            <div className="grid grid-cols-2 gap-4 h-full relative z-10">

                {/* Left Panel: Fast Fashion */}
                <div className="flex flex-col">
                    <h4 className="font-sans font-medium text-charcoal mb-6 text-sm">Fast Fashion Pick</h4>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-end border-b border-charcoal/10 pb-1">
                            <span className="font-mono text-[9px] text-charcoal/50 uppercase">Price</span>
                            <NumberTicker value={fastFashion.price} prefix="$" />
                        </div>
                        <div className="flex justify-between items-end border-b border-charcoal/10 pb-1">
                            <span className="font-mono text-[9px] text-charcoal/50 uppercase">Est. Wears</span>
                            <NumberTicker value={fastFashion.wears} />
                        </div>
                        <div className="flex justify-between items-end pb-1 text-rust">
                            <span className="font-mono text-[9px] uppercase font-bold">CPW</span>
                            <span className="font-bold"><NumberTicker value={fastFashion.cpw} prefix="$" /></span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Quality */}
                <div className="flex flex-col">
                    <h4 className="font-sans font-medium text-charcoal mb-6 text-sm">Quality Alternative</h4>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-end border-b border-charcoal/10 pb-1">
                            <span className="font-mono text-[9px] text-charcoal/50 uppercase">Price</span>
                            <NumberTicker value={quality.price} prefix="$" />
                        </div>
                        <div className="flex justify-between items-end border-b border-charcoal/10 pb-1">
                            <span className="font-mono text-[9px] text-charcoal/50 uppercase">Est. Wears</span>
                            <NumberTicker value={quality.wears} />
                        </div>
                        <div className="flex justify-between items-end pb-1 text-forest">
                            <span className="font-mono text-[9px] uppercase font-bold">CPW</span>
                            <span className="font-bold"><NumberTicker value={quality.cpw} prefix="$" /></span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Arrow Indicator Component */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-cream border border-charcoal/10 shadow-sm">
                <motion.div
                    initial={{ rotate: 180, scale: 0.8, fill: "var(--color-rust)" }}
                    animate={resolved ? { rotate: 0, scale: 1, color: "var(--color-forest)" } : {}}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className={cn("transition-colors", resolved ? "text-forest" : "text-rust")}
                >
                    <ArrowRight weight="bold" className="w-4 h-4" />
                </motion.div>
            </div>

            {/* Savings Badge */}
            <div className="mt-auto flex justify-center h-10">
                <AnimatePresence>
                    {resolved && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 150, damping: 12 }}
                            className="bg-forest/10 border border-forest/20 text-forest px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider flex items-center"
                        >
                            You save ${savings}/wear
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
});
