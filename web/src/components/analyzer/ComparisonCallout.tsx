"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { CpwData } from "@/types/analysis";
import { ArrowRight, Scales } from "@phosphor-icons/react";

interface ComparisonCalloutProps {
    cpw: CpwData;
    query: string;
}

function formatCurrency(value: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

// Generate a classic equivalent description based on the query
function getClassicEquivalent(query: string): string {
    const lower = query.toLowerCase();
    if (lower.includes("flat") || lower.includes("shoe") || lower.includes("boot")) {
        return "Classic leather equivalent";
    }
    if (lower.includes("jean") || lower.includes("pant") || lower.includes("trouser")) {
        return "Classic straight-leg equivalent";
    }
    if (lower.includes("dress")) {
        return "Classic A-line equivalent";
    }
    if (lower.includes("jacket") || lower.includes("coat")) {
        return "Classic tailored equivalent";
    }
    if (lower.includes("bag") || lower.includes("purse")) {
        return "Classic leather equivalent";
    }
    return "Classic equivalent";
}

export const ComparisonCallout = memo(function ComparisonCallout({
    cpw,
    query,
}: ComparisonCalloutProps) {
    const classicDesc = getClassicEquivalent(query);
    // Classic gets full material durability (no trend penalty)
    const classicPrice = Math.round(cpw.price * 1.07); // slightly higher for classic quality
    const classicCpw = Math.round((classicPrice / cpw.standardWears) * 100) / 100;
    const classicWears = cpw.standardWears;
    const multiplier = cpw.trendAdjustedCpw / classicCpw;
    const isSignificant = multiplier > 1.3;

    if (!isSignificant) return null;

    return (
        <div className="w-full">
            <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-sans text-sm font-semibold text-charcoal/60 uppercase tracking-widest">
                    Trendy vs. Classic
                </h3>
                <div className="flex items-center gap-1.5">
                    <Scales weight="duotone" className="w-3.5 h-3.5 text-charcoal/30" />
                    <span className="font-mono text-[10px] text-charcoal/35 uppercase tracking-wider">
                        Side-by-side
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trendy Item */}
                <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative p-5 rounded-2xl border-2 border-[#C84B31]/20 bg-[#C84B31]/[0.02]"
                >
                    <span className="absolute top-3 right-3 font-mono text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C84B31]/10 text-[#C84B31]">
                        Trendy
                    </span>
                    <h4 className="font-sans text-sm font-semibold text-charcoal mb-1 capitalize pr-16">
                        {query}
                    </h4>
                    <p className="font-mono text-xs text-charcoal/40 mb-4">
                        {formatCurrency(cpw.price, cpw.currency)}
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                            <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">Wears</span>
                            <span className="font-mono text-sm font-semibold text-charcoal tabular-nums">
                                ~{cpw.trendAdjustedWears}
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">CPW</span>
                            <span className="font-mono text-lg font-bold text-[#C84B31] tabular-nums">
                                {formatCurrency(cpw.trendAdjustedCpw)}
                            </span>
                        </div>
                    </div>

                    {/* Mini bar */}
                    <div className="mt-3 w-full h-1.5 bg-charcoal/[0.06] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-[#C84B31]/60"
                        />
                    </div>
                </motion.div>

                {/* Classic Equivalent */}
                <motion.div
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative p-5 rounded-2xl border-2 border-[#2C4A3E]/20 bg-[#2C4A3E]/[0.02]"
                >
                    <span className="absolute top-3 right-3 font-mono text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2C4A3E]/10 text-[#2C4A3E]">
                        Classic
                    </span>
                    <h4 className="font-sans text-sm font-semibold text-charcoal mb-1 pr-16">
                        {classicDesc}
                    </h4>
                    <p className="font-mono text-xs text-charcoal/40 mb-4">
                        {formatCurrency(classicPrice, cpw.currency)}
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                            <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">Wears</span>
                            <span className="font-mono text-sm font-semibold text-charcoal tabular-nums">
                                ~{classicWears}
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">CPW</span>
                            <span className="font-mono text-lg font-bold text-[#2C4A3E] tabular-nums">
                                {formatCurrency(classicCpw)}
                            </span>
                        </div>
                    </div>

                    {/* Mini bar */}
                    <div className="mt-3 w-full h-1.5 bg-charcoal/[0.06] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (classicCpw / cpw.trendAdjustedCpw) * 100)}%` }}
                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-[#2C4A3E]/60"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Verdict */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-charcoal/[0.03] border border-charcoal/[0.06]"
            >
                <ArrowRight weight="bold" className="w-4 h-4 text-[#C84B31] shrink-0" />
                <p className="font-sans text-sm text-charcoal/60 leading-relaxed">
                    The trendy version costs{" "}
                    <span className="font-semibold text-[#C84B31]">
                        {multiplier.toFixed(1)}x more per wear
                    </span>{" "}
                    than a classic equivalent with the same material quality.
                </p>
            </motion.div>
        </div>
    );
});
