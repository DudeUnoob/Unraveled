"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Browser, Warning, CheckCircle, Scan } from "@phosphor-icons/react";

type ScanState = "IDLE" | "SCANNING" | "WARNING" | "ALTERNATIVE";

export function InteractiveExtensionMock() {
    const [scanState, setScanState] = useState<ScanState>("IDLE");

    const handleScan = () => {
        setScanState("SCANNING");
        // Simulate network/analysis delay
        setTimeout(() => setScanState("WARNING"), 2000);
    };

    const handleAlternative = () => {
        setScanState("ALTERNATIVE");
    };

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
                    {scanState === "ALTERNATIVE" ? "everlane.com/products/linen-shirt" : "zara.com/us/en/product/fast-fashion"}
                </div>
            </div>

            {/* Shop interface */}
            <div className="p-8 flex gap-8 flex-1 relative bg-white">
                {/* Product Image Area */}
                <div className="w-1/3 relative h-[240px] rounded-md overflow-hidden bg-slate-100">
                    <AnimatePresence mode="wait">
                        {scanState === "ALTERNATIVE" ? (
                            <motion.img
                                key="good"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src="https://images.unsplash.com/photo-1760661696925-85cd09cac428?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHN1c3RhaW5hYmxlJTIwd2VhcnxlbnwwfHwwfHx8MA%3D%3D"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <motion.div
                                key="bad"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full bg-slate-100 flex items-center justify-center relative"
                            >
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
                                        className="absolute left-0 right-0 h-1bg-rust/50 shadow-[0_0_10px_rgba(200,75,49,0.8)] z-10 border-b border-rust"
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Product Details Area */}
                <div className="w-2/3 flex flex-col gap-4 pt-2">
                    <AnimatePresence mode="wait">
                        <motion.div key={scanState === "ALTERNATIVE" ? "alt" : "orig"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-3/4 h-6">
                            {scanState === "ALTERNATIVE" ? (
                                <div className="font-sans font-medium text-[16px] text-charcoal tracking-tight">Organic Linen Shirt</div>
                            ) : (
                                <div className="h-full bg-slate-200 rounded" />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="h-4 w-1/4 bg-slate-100 rounded mb-6" />

                    {scanState === "IDLE" ? (
                        <button
                            onClick={handleScan}
                            className="h-12 w-full bg-charcoal text-cream rounded-[4px] font-sans text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-charcoal/90 transition-colors shadow-sm"
                        >
                            <Scan className="w-4 h-4" /> Analyze with Unravel
                        </button>
                    ) : (
                        <div className="h-12 w-full bg-slate-100 rounded pointer-events-none" />
                    )}
                </div>
            </div>

            {/* Slide in Warning/Approval Overlay */}
            <AnimatePresence>
                {(scanState === "WARNING" || scanState === "ALTERNATIVE") && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: "0%" }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className={`absolute right-0 top-12 bottom-0 w-[60%] backdrop-blur-xl p-6 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] border-l z-30 flex flex-col
                            ${scanState === "WARNING"
                                ? "bg-charcoal/95 text-cream border-white/5"
                                : "bg-[#4A6741]/95 text-cream border-white/10"}`}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="font-sans font-medium tracking-tighter text-xl">
                                ✱ UNRAVEL
                            </h4>
                            {scanState === "WARNING" ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rust/20 text-rust border border-rust/30">
                                    <Warning weight="fill" className="w-3.5 h-3.5" />
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Warning</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/20 text-white border border-white/30">
                                    <CheckCircle weight="fill" className="w-3.5 h-3.5" />
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Approved</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5 mb-8">
                            <span className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-60">Estimated Cost Per Wear</span>
                            <div className={`font-mono text-4xl tracking-tighter ${scanState === "WARNING" ? "text-rust" : "text-white"}`}>
                                {scanState === "WARNING" ? "$14.50" : "$1.88"}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-[4px] p-5 border border-white/10 flex-1 flex flex-col">
                            <h5 className="font-sans text-[13px] font-medium mb-1 tracking-tight">
                                {scanState === "WARNING" ? "Trend Decay" : "Durability Profile"}
                            </h5>
                            <p className="font-sans text-[12px] opacity-70 mb-4 leading-relaxed">
                                {scanState === "WARNING" ? "Aesthetic fading. Out of style in ~4 mos." : "Timeless aesthetic. Built for 40+ wears."}
                            </p>

                            {scanState === "WARNING" && (
                                <button
                                    onClick={handleAlternative}
                                    className="mt-auto w-full py-2.5 bg-cream text-charcoal text-[13px] font-medium rounded shadow-sm hover:bg-white transition-colors"
                                >
                                    Find Alternative
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
