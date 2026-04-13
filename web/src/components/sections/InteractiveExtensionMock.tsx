"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Browser, Warning, CheckCircle, Scan, MagicWand } from "@phosphor-icons/react";
import { CpwComparisonWidget } from "@/components/dashboard/CpwComparisonWidget";

export function InteractiveExtensionMock({ activeFeature = 0 }: { activeFeature?: number }) {
    // We keep a local scan state for the "Telemetry" feature specifically to animate the scan line
    const [scanState, setScanState] = useState<"IDLE" | "SCANNING" | "WARNING">("IDLE");

    useEffect(() => {
        if (activeFeature === 0) {
            setTimeout(() => setScanState("IDLE"), 0);
            const t1 = setTimeout(() => setScanState("SCANNING"), 1000);
            const t2 = setTimeout(() => setScanState("WARNING"), 2500);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [activeFeature]);

    return (
        <div className="w-full max-w-[550px] bg-white rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-charcoal/10 overflow-hidden flex flex-col relative z-10 h-[450px]">
            {/* Chrome Header */}
            <div className="h-12 border-b border-charcoal/5 flex items-center px-4 gap-3 bg-white z-20 relative">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 bg-slate-50 rounded h-7 flex items-center justify-center px-4 font-mono text-[11px] text-charcoal/40 transition-colors">
                    <Browser className="w-3.5 h-3.5 mr-2" />
                    zara.com/us/en/product/fast-fashion
                </div>
            </div>

            {/* Main Interface */}
            <div className="flex-1 relative bg-white flex flex-col">
                <AnimatePresence mode="wait">

                    {/* FEATURE 0: Telemetry */}
                    {activeFeature === 0 && (
                        <motion.div
                            key="feat-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-8 flex gap-8 flex-1 relative bg-white h-full"
                        >
                            {/* Product Image Area */}
                            <div className="w-1/3 relative h-[240px] rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=300&h=400"
                                    className="w-full h-full object-cover grayscale-[0.2]"
                                />
                                {/* Overlay scan line */}
                                {scanState === "SCANNING" && (
                                    <motion.div
                                        initial={{ top: "0%" }}
                                        animate={{ top: "100%" }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-rust/50 shadow-[0_0_10px_rgba(200,75,49,0.8)] z-10 border-b border-rust"
                                    />
                                )}
                            </div>

                            {/* Product Details Area */}
                            <div className="w-2/3 flex flex-col gap-4 pt-2">
                                <div className="h-6 w-3/4 bg-slate-200 rounded" />
                                <div className="h-4 w-1/4 bg-slate-100 rounded mb-6" />

                                <div className="h-12 w-full bg-slate-100 rounded pointer-events-none flex items-center justify-center text-charcoal/40 font-sans text-[13px] font-medium gap-2">
                                    <Scan className="w-4 h-4" /> {scanState === "SCANNING" ? "Analyzing..." : "Unravel Active"}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* FEATURE 1: Cost Per Wear */}
                    {activeFeature === 1 && (
                        <motion.div
                            key="feat-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center p-0"
                        >
                            <div className="w-full h-full transform scale-[0.95]">
                                <CpwComparisonWidget />
                            </div>
                        </motion.div>
                    )}

                    {/* FEATURE 2: Data Collection */}
                    {activeFeature === 2 && (
                        <motion.div
                            key="feat-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-8 flex-1 flex flex-col justify-center items-center bg-white relative"
                        >
                            {/* Unstructured Text Block Animating into Structured Pills */}
                            <div className="w-full max-w-sm space-y-6">
                                <div className="flex items-center gap-2 mb-4 text-charcoal/40 font-mono text-[10px] uppercase tracking-widest">
                                    <MagicWand className="w-4 h-4" /> Extracting from DOM...
                                </div>

                                {/* Raw Text */}
                                <motion.p
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: 0.3 }}
                                    transition={{ duration: 2, delay: 0.5 }}
                                    className="font-sans text-[13px] text-charcoal/60 leading-relaxed border-l-2 border-charcoal/10 pl-4 italic"
                                >
                                    &quot;This beautiful summer blouse is crafted carefully from 85% recycled polyester and 15% elastane. Made in our partner facilities in Bangladesh. Machine wash cold.&quot;
                                </motion.p>

                                {/* Structured Pills appearing */}
                                <div className="flex flex-wrap gap-2 pt-4">
                                    <DataPill delay={1} icon="Materials" text="85% Recycled Polyester" color="bg-forest/10 text-forest border-forest/20" />
                                    <DataPill delay={1.2} icon="Materials" text="15% Elastane" color="bg-charcoal/5 text-charcoal border-charcoal/10" />
                                    <DataPill delay={1.4} icon="Origin" text="Bangladesh" color="bg-rust/10 text-rust border-rust/20" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Slide in Warning/Approval Overlay for Feature 0 */}
            <AnimatePresence>
                {(activeFeature === 0 && scanState === "WARNING") && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: "0%" }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="absolute right-0 top-12 bottom-0 w-[60%] backdrop-blur-xl p-6 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] border-l z-30 flex flex-col bg-charcoal/95 text-cream border-white/5"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="font-sans font-medium tracking-tighter text-xl">
                                ✱ UNRAVEL
                            </h4>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rust/20 text-rust border border-rust/30">
                                <Warning weight="fill" className="w-3.5 h-3.5" />
                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Warning</span>
                            </div>
                        </div>

                        <div className="space-y-1.5 mb-8">
                            <span className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-60">Estimated Cost Per Wear</span>
                            <div className="font-mono text-4xl tracking-tighter text-rust">
                                $14.50
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-[4px] p-5 border border-white/10 flex-1 flex flex-col">
                            <h5 className="font-sans text-[13px] font-medium mb-1 tracking-tight">
                                Trend Decay
                            </h5>
                            <p className="font-sans text-[12px] opacity-70 mb-4 leading-relaxed">
                                Aesthetic fading. Out of style in ~4 mos.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DataPill({ text, delay, color }: { text: string, delay: number, icon: string, color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}
            className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border flex items-center gap-1.5 ${color}`}
        >
            {text}
        </motion.div>
    );
}
