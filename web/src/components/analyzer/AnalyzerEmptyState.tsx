"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ChartLine, TrendUp, Timer, Lightning } from "@phosphor-icons/react";

const EXAMPLE_QUERIES = [
    "barrel leg jeans",
    "mesh ballet flats",
    "butter yellow",
    "mob wife aesthetic",
    "quiet luxury blazer",
    "crochet top",
];

const FEATURES = [
    {
        icon: TrendUp,
        title: "Trend velocity detection",
        description: "We pull real-time search interest from Google Trends spanning 52 weeks of data.",
    },
    {
        icon: ChartLine,
        title: "Decay curve modeling",
        description: "A logistic growth + exponential decay model projects exactly when the trend flatlines.",
    },
    {
        icon: Timer,
        title: "Weeks-until-death projection",
        description: "Know the precise number of weeks before a style drops below 15% of its peak interest.",
    },
    {
        icon: Lightning,
        title: "Paired with the extension",
        description: "Using our Chrome extension? Products you score there link directly here for deep analysis.",
    },
];

export const AnalyzerEmptyState = memo(function AnalyzerEmptyState() {
    return (
        <div className="mt-16">
            {/* Example queries */}
            <div className="mb-16">
                <span className="block font-mono text-[10px] text-charcoal/30 uppercase tracking-widest mb-4">
                    Try these
                </span>
                <div className="flex flex-wrap gap-2">
                    {EXAMPLE_QUERIES.map((q) => (
                        <motion.button
                            key={q}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-4 py-2 bg-charcoal/[0.04] hover:bg-charcoal/[0.08] border border-charcoal/[0.06] rounded-xl font-sans text-sm text-charcoal/60 transition-colors cursor-pointer"
                            onClick={() => {
                                // Find the input and fill it
                                const input = document.querySelector<HTMLInputElement>(
                                    'input[type="text"]'
                                );
                                if (input) {
                                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                                        window.HTMLInputElement.prototype,
                                        "value"
                                    )?.set;
                                    nativeInputValueSetter?.call(input, q);
                                    input.dispatchEvent(new Event("input", { bubbles: true }));
                                    input.dispatchEvent(new Event("change", { bubbles: true }));
                                    input.focus();
                                }
                            }}
                        >
                            {q}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* How it works */}
            <div>
                <span className="block font-mono text-[10px] text-charcoal/30 uppercase tracking-widest mb-6">
                    How it works
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.3 + i * 0.1,
                                duration: 0.5,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="flex items-start gap-4"
                        >
                            <div className="shrink-0 w-9 h-9 rounded-xl bg-forest/[0.06] flex items-center justify-center">
                                <feature.icon weight="duotone" className="w-4.5 h-4.5 text-forest/60" />
                            </div>
                            <div>
                                <h4 className="font-sans text-sm font-semibold text-charcoal mb-1">
                                    {feature.title}
                                </h4>
                                <p className="font-sans text-xs text-charcoal/40 leading-relaxed max-w-xs">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
});
