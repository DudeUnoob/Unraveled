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
        iconSrc: "/icon-velocity.png",
        title: "Trend velocity detection",
        description: "We pull real-time search interest from Google Trends spanning 52 weeks of data.",
    },
    {
        icon: ChartLine,
        iconSrc: "/icon-projection.png",
        title: "Weeks-until-death projection",
        description: "Know the exact number of weeks before a style drops below 15% of its peak interest.",
    },
    {
        icon: Timer,
        iconSrc: "/icon-decay.png",
        title: "Weeks-until-death projection",
        description: "Know the exact number of weeks before a style drops below 15% of its peak interest.",
    },
    {
        icon: Lightning,
        iconSrc: "/icon-ecosystem.png",
        title: "Weeks-until-death projection",
        description: "Know the exact number of weeks before a style drops below 15% of its peak interest.",
    },
];

export const AnalyzerEmptyState = memo(function AnalyzerEmptyState() {
    return (
        <div className="mt-20 flex flex-col gap-24">
            {/* Try these - Premium Tags */}
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-px bg-forest/20" />
                    <span className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em]">
                        Recommended Queries
                    </span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {EXAMPLE_QUERIES.map((q, i) => (
                        <motion.button
                            key={q}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(92, 108, 71, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                            className="px-5 py-2.5 bg-forest-light/10 border border-forest/5 rounded-full font-sans text-sm font-bold text-forest transition-all duration-300"
                            onClick={() => {
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

            {/* How it works - White Card with 2x2 Grid */}
            <div className="bg-white rounded-[40px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-10 md:p-14">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-forest mb-10">
                    How it works..
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={`${feature.title}-${i}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: i * 0.1,
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="flex items-start gap-4"
                        >
                            <div className="w-[50px] h-[50px] shrink-0">
                                <img
                                    src={feature.iconSrc}
                                    alt=""
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="font-serif text-xl font-bold text-forest">
                                    {feature.title}
                                </h4>
                                <p className="font-serif text-sm text-forest leading-relaxed max-w-[250px]">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Spacer before footer */}
            <div className="h-8" />
        </div>
    );
});
