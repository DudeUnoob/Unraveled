"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import type { CpwData } from "@/types/analysis";
import { ArrowRight, Scales, PencilSimple, Check, Warning, ShieldCheck } from "@phosphor-icons/react";

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
    const autoClassicPrice = Math.round(cpw.price * 1.07);
    const autoClassicWears = cpw.standardWears;

    const [editMode, setEditMode] = useState(false);
    const [customClassicPrice, setCustomClassicPrice] = useState<string>("");
    const [customClassicWears, setCustomClassicWears] = useState<string>("");
    const hasCustom = customClassicPrice !== "" || customClassicWears !== "";

    const classicPrice = customClassicPrice ? parseFloat(customClassicPrice) : autoClassicPrice;
    const classicWears = customClassicWears ? parseInt(customClassicWears, 10) : autoClassicWears;
    const classicCpw = classicWears > 0 ? Math.round((classicPrice / classicWears) * 100) / 100 : 0;
    const multiplier = classicCpw > 0 ? cpw.trendAdjustedCpw / classicCpw : 0;
    const isSignificant = hasCustom || multiplier > 1.3;

    if (!isSignificant) return null;

    return (
        <div className="w-full relative z-10">
            <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-1">
                    <h3 className="font-sans text-[10px] font-bold text-cream/30 uppercase tracking-[0.2em]">
                        Trendy vs. Classic
                    </h3>
                    <p className="font-sans text-xs text-cream/40 font-medium">
                        Comparing real cost per wear based on trend lifespan.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setEditMode((p) => !p)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-cream/60 hover:text-cream hover:bg-white/20 transition-all duration-300"
                    >
                        {editMode ? (
                            <Check weight="bold" className="w-3 h-3" />
                        ) : (
                            <PencilSimple weight="bold" className="w-3 h-3" />
                        )}
                        <span className="font-mono text-[10px] uppercase font-bold tracking-widest">
                            {editMode ? "Confirm" : "Adjust Classic"}
                        </span>
                    </button>
                    <Scales weight="bold" className="w-5 h-5 text-cream/20" />
                </div>
            </div>

            {/* Custom inputs with Glassmorphism */}
            {editMode && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-wrap items-center gap-4 mb-10 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md"
                >
                    <div className="flex flex-col gap-2">
                        <label className="font-mono text-[9px] uppercase font-bold text-cream/30 tracking-widest">Price</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customClassicPrice}
                            onChange={(e) => setCustomClassicPrice(e.target.value)}
                            placeholder={`$${autoClassicPrice}`}
                            className="w-36 py-2 px-4 bg-white/10 border-b border-white/20 rounded-t-lg font-mono text-sm text-cream placeholder:text-cream/20 focus:outline-none focus:border-white transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-mono text-[9px] uppercase font-bold text-cream/30 tracking-widest">Est. Wears</label>
                        <input
                            type="number"
                            min="1"
                            value={customClassicWears}
                            onChange={(e) => setCustomClassicWears(e.target.value)}
                            placeholder={String(autoClassicWears)}
                            className="w-36 py-2 px-4 bg-white/10 border-b border-white/20 rounded-t-lg font-mono text-sm text-cream placeholder:text-cream/20 focus:outline-none focus:border-white transition-all"
                        />
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Trendy Item Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative p-8 rounded-[2rem] bg-rust/10 border border-rust/20 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-rust/20 text-rust">
                            Trendy
                        </span>
                        <Warning weight="bold" className="w-5 h-5 text-rust/40" />
                    </div>
                    
                    <h4 className="font-sans text-xl font-bold text-cream mb-1 capitalize">
                        {query}
                    </h4>
                    <span className="font-mono text-xs font-bold text-cream/30 uppercase tracking-widest mb-8">
                        Price: {formatCurrency(cpw.price, cpw.currency)}
                    </span>

                    <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-cream/30 uppercase font-bold tracking-widest">Est. Wears</span>
                            <span className="font-mono text-sm font-bold text-cream tabular-nums opacity-60">
                                ~{cpw.trendAdjustedWears}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-cream/30 uppercase font-bold tracking-widest">Cost / Wear</span>
                            <span className="font-mono text-3xl font-bold text-rust tabular-nums tracking-tighter">
                                {formatCurrency(cpw.trendAdjustedCpw)}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Classic Equivalent Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-cream/60">
                            Classic
                        </span>
                        <ShieldCheck weight="bold" className="w-5 h-5 text-cream/20" />
                    </div>
                    
                    <h4 className="font-sans text-xl font-bold text-cream mb-1">
                        {classicDesc}
                    </h4>
                    <span className="font-mono text-xs font-bold text-cream/30 uppercase tracking-widest mb-8">
                        Price: {formatCurrency(classicPrice, cpw.currency)}
                    </span>

                    <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-cream/30 uppercase font-bold tracking-widest">Est. Wears</span>
                            <span className="font-mono text-sm font-bold text-cream tabular-nums opacity-60">
                                ~{classicWears}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-cream/30 uppercase font-bold tracking-widest">Cost / Wear</span>
                            <span className="font-mono text-3xl font-bold text-cream tabular-nums tracking-tighter opacity-80">
                                {formatCurrency(classicCpw)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Premium Verdict Banner */}
            {multiplier > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-10 flex flex-col md:flex-row items-center gap-6 p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden relative"
                >
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-rust/20 flex items-center justify-center">
                        <ArrowRight weight="bold" className="w-6 h-6 text-rust" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <p className="font-sans text-lg md:text-xl font-bold text-cream leading-tight mb-1">
                            The trendy version costs{" "}
                            <span className="text-rust">
                                {multiplier.toFixed(1)}x more
                            </span>{" "}
                            per wear.
                        </p>
                        <p className="font-sans text-xs text-cream/40 font-medium tracking-wide">
                            Based on projected trend decay and historical usage patterns for similar silhouettes.
                        </p>
                    </div>

                    <div className="font-mono text-6xl font-black text-white/5 absolute -right-4 -bottom-4 select-none pointer-events-none tracking-tighter">
                        {multiplier.toFixed(1)}X
                    </div>
                </motion.div>
            )}
        </div>
    );
});
