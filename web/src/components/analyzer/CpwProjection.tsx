"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { CpwData } from "@/types/analysis";
import { CurrencyDollar, TShirt, TrendDown } from "@phosphor-icons/react";

interface CpwProjectionProps {
    cpw: CpwData;
}

function formatCurrency(value: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function getCpwColor(cpw: number): string {
    if (cpw <= 2) return "#2C4A3E";
    if (cpw <= 5) return "#D4883C";
    return "#C84B31";
}

export const CpwProjection = memo(function CpwProjection({ cpw }: CpwProjectionProps) {
    const trendCpwColor = getCpwColor(cpw.trendAdjustedCpw);
    const standardCpwColor = getCpwColor(cpw.standardCpw);
    const isWorse = cpw.trendAdjustedCpw > cpw.standardCpw * 1.2;

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-sans text-sm font-semibold text-charcoal/60 uppercase tracking-widest">
                    Cost per wear
                </h3>
                <span className="font-mono text-[10px] text-charcoal/35 uppercase tracking-wider">
                    {formatCurrency(cpw.price, cpw.currency)} purchase price
                </span>
            </div>

            {/* CPW Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Standard CPW */}
                <div className="relative p-5 rounded-2xl border border-charcoal/[0.06] bg-white/50">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-charcoal/[0.04]">
                            <TShirt weight="duotone" className="w-4 h-4 text-charcoal/40" />
                        </div>
                        <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">
                            Material durability
                        </span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <span
                            className="block font-mono text-3xl font-bold tabular-nums tracking-tight mb-1"
                            style={{ color: standardCpwColor }}
                        >
                            {formatCurrency(cpw.standardCpw)}
                        </span>
                        <span className="font-sans text-xs text-charcoal/40">per wear</span>
                    </motion.div>
                    <div className="mt-4 pt-3 border-t border-charcoal/[0.06]">
                        <span className="font-mono text-xs text-charcoal/50 tabular-nums">
                            ~{cpw.standardWears} estimated wears
                        </span>
                    </div>
                </div>

                {/* Trend-Adjusted CPW */}
                <div className="relative p-5 rounded-2xl border-2 bg-white/50"
                    style={{ borderColor: `${trendCpwColor}30` }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${trendCpwColor}12` }}
                        >
                            <TrendDown weight="duotone" className="w-4 h-4" style={{ color: trendCpwColor }} />
                        </div>
                        <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">
                            Trend-adjusted
                        </span>
                        {isWorse && (
                            <span className="ml-auto font-mono text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${trendCpwColor}12`, color: trendCpwColor }}
                            >
                                Real cost
                            </span>
                        )}
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                    >
                        <span
                            className="block font-mono text-3xl font-bold tabular-nums tracking-tight mb-1"
                            style={{ color: trendCpwColor }}
                        >
                            {formatCurrency(cpw.trendAdjustedCpw)}
                        </span>
                        <span className="font-sans text-xs text-charcoal/40">per wear</span>
                    </motion.div>
                    <div className="mt-4 pt-3 border-t border-charcoal/[0.06]">
                        <span className="font-mono text-xs text-charcoal/50 tabular-nums">
                            ~{cpw.trendAdjustedWears} wears before trend fades
                        </span>
                    </div>
                </div>
            </div>

            {/* Insight callout */}
            {isWorse && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-[#C84B31]/[0.05] border border-[#C84B31]/10"
                >
                    <CurrencyDollar weight="bold" className="w-4 h-4 text-[#C84B31] mt-0.5 shrink-0" />
                    <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                        Accounting for trend lifespan, this item&apos;s <strong>real cost per wear</strong> is{" "}
                        <span className="font-semibold" style={{ color: trendCpwColor }}>
                            {(cpw.trendAdjustedCpw / cpw.standardCpw).toFixed(1)}x higher
                        </span>{" "}
                        than the material durability alone suggests.
                    </p>
                </motion.div>
            )}
        </div>
    );
});
