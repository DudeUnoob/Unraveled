"use client";
import { memo } from "react";
import { motion } from "framer-motion";
import type { CpwData } from "@/types/analysis";
import { CurrencyDollar, TShirt, TrendDown, } from "@phosphor-icons/react";
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
function getCpwColor(cpwValue: number): string {
    if (cpwValue <= 2) return "#5c6c47";
    if (cpwValue <= 5) return "#D4883C";
    return "#C84B31";
}
export const CpwProjection = memo(function CpwProjection({ cpw }: CpwProjectionProps) {
    const trendCpwColor = getCpwColor(cpw.trendAdjustedCpw);
//     const standardCpwColor = getCpwColor(cpw.standardCpw);
    const isWorse = cpw.trendAdjustedCpw > cpw.standardCpw * 1.2;
    return (
        <div className="w-full flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-1">
                    <h3 className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em]">
                        Real Cost Per Wear
                    </h3>
                    <p className="font-sans text-xs text-charcoal/40 font-medium">
                        Projected {formatCurrency(cpw.price, cpw.currency)} purchase.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-light/10 border border-forest/5">
                    <CurrencyDollar weight="bold" className="w-3.5 h-3.5 text-forest" />
                    <span className="font-mono text-[9px] font-bold text-forest/60 uppercase tracking-widest">
                        Economic Fit
                    </span>
                </div>
            </div>
            {/* CPW Metrics - Unboxed & Stacked (Cockpit Mode) */}
            <div className="flex flex-col gap-10">
                {/* Trend-Adjusted CPW (Highlighted) */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rust/5 flex items-center justify-center">
                                <TrendDown weight="bold" className="w-4 h-4 text-rust" />
                            </div>
                            <span className="font-sans text-sm font-bold text-charcoal tracking-tight">Trend-Adjusted CPW</span>
                        </div>
                         {isWorse && (
                            <span className="font-mono text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-rust/10 text-rust">
                                Peak Adjusted
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-baseline gap-3">
                        <motion.span 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="font-mono text-5xl font-bold tracking-tighter tabular-nums"
                            style={{ color: trendCpwColor }}
                        >
                            {formatCurrency(cpw.trendAdjustedCpw)}
                        </motion.span>
                        <span className="font-sans text-xs font-bold text-charcoal/30 uppercase tracking-widest">/ wear</span>
                    </div>
                    <p className="font-mono text-[10px] text-charcoal/40 font-medium">
                        Capped by <span className="text-charcoal font-bold">~{cpw.trendAdjustedWears}</span> wears before trend death.
                    </p>
                </div>
                {/* Standard CPW (Comparative) */}
                <div className="flex flex-col gap-4 pt-8 border-t border-forest/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-forest-light/30 flex items-center justify-center">
                                <TShirt weight="bold" className="w-4 h-4 text-forest" />
                            </div>
                            <span className="font-sans text-sm font-bold text-charcoal/40 tracking-tight">Material Durability CPW</span>
                        </div>
                    </div>
                    
                    <div className="flex items-baseline gap-3">
                        <span 
                            className="font-mono text-3xl font-medium tracking-tighter tabular-nums text-charcoal/60"
                        >
                            {formatCurrency(cpw.standardCpw)}
                        </span>
                        <span className="font-sans text-xs font-bold text-charcoal/20 uppercase tracking-widest">/ wear</span>
                    </div>
                    <p className="font-mono text-[10px] text-charcoal/30 font-medium">
                        Based on <span className="font-bold">~{cpw.standardWears}</span> wears (material lifespan).
                    </p>
                </div>
            </div>
            {/* Insight Callout */}
            {isWorse && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="mt-auto pt-8 flex items-start gap-4"
                >
                    <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-rust mt-1.5" />
                    <p className="font-sans text-xs text-charcoal/50 leading-relaxed">
                        Accounting for trend lifespan, this item&apos;s <span className="font-bold text-charcoal">real cost</span> is{" "}
                        <span className="text-rust font-bold">
                            {(cpw.trendAdjustedCpw / cpw.standardCpw).toFixed(1)}x higher
                        </span>{" "}
                        than material durability alone suggests.
                    </p>
                </motion.div>
            )}
        </div>
    );
});