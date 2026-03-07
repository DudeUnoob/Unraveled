"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Browser, Warning } from "@phosphor-icons/react";
import { FiberBarWidget } from "@/components/dashboard/FiberBarWidget";
import { CpwComparisonWidget } from "@/components/dashboard/CpwComparisonWidget";
import { GaugeWidget } from "@/components/dashboard/GaugeWidget";

export function ProductJourney() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Parallax subtle shifts for product previews
    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [-50, 50]);

    return (
        <section ref={containerRef} className="w-full bg-[#f6f5f1] text-charcoal py-32 md:py-48 flex flex-col gap-48">

            {/* Feature 1: The AI Overlay (Extension) */}
            <div className="max-w-[1200px] mx-auto w-full px-4 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                {/* Text: Left */}
                <div className="lg:w-1/3 flex flex-col justify-start">
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-charcoal/5 text-charcoal/60 px-3 py-1.5 rounded-full w-max mb-6">Intercept</span>
                    <h3 className="font-sans text-3xl md:text-5xl font-medium leading-tight tracking-tight mb-6">
                        Drive better decisions with Unravel Engine
                    </h3>
                    <p className="font-sans text-charcoal/70 leading-relaxed mb-8">
                        The Unravel platform is built to help consumers shop consciously. Optimized to eliminate greenwashing friction and instantly deliver sustainability data at the point of purchase.
                    </p>

                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-white border border-charcoal/10 flex items-center justify-center shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-sans font-medium text-charcoal mb-1">Instant telemetry</h4>
                                <p className="font-sans text-sm text-charcoal/60">A powerful engine translates material data and trend velocity into actionable insight instantly.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-white border border-charcoal/10 flex items-center justify-center shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-sans font-medium text-charcoal mb-1">Cost Per Wear Projection</h4>
                                <p className="font-sans text-sm text-charcoal/60">Eliminate manual guesswork. Visualize the true financial impact of micro-trends over time.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* UI: Right */}
                <div className="lg:w-2/3 w-full bg-[#e8e6df] rounded-[2rem] p-8 md:p-12 h-[500px] relative overflow-hidden flex items-center justify-center border border-charcoal/5">

                    {/* Floating Browser Mock */}
                    <motion.div style={{ y: y1 }} className="w-full max-w-[500px] bg-white rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-charcoal/10 overflow-hidden flex flex-col relative z-10">
                        {/* Chrome Header */}
                        <div className="h-10 border-b border-charcoal/5 flex items-center px-4 gap-3 bg-white">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            </div>
                            <div className="flex-1 bg-slate-50 rounded h-6 flex items-center px-2 font-mono text-[9px] text-charcoal/30">
                                <Browser className="w-3 h-3 mr-1" /> zara.com/us/en/product
                            </div>
                        </div>

                        {/* Shop interface */}
                        <div className="p-6 flex gap-6">
                            <div className="w-1/3 aspect-[3/4] bg-slate-100 rounded" />
                            <div className="w-2/3 flex flex-col gap-3">
                                <div className="h-6 w-3/4 bg-slate-200 rounded" />
                                <div className="h-4 w-1/4 bg-slate-100 rounded mb-4" />
                                <div className="h-8 w-full bg-charcoal rounded" />
                            </div>
                        </div>

                        {/* Slide in warning */}
                        <motion.div
                            initial={{ x: "100%" }}
                            whileInView={{ x: "0%" }}
                            viewport={{ margin: "-100px" }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="absolute right-0 top-10 bottom-0 w-[60%] bg-charcoal/95 backdrop-blur-xl text-cream p-5 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] border-l border-white/5"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-serif italic text-xl">Unravel.</h4>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rust/20 text-rust">
                                    <Warning weight="fill" className="w-3 h-3" />
                                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Warning</span>
                                </div>
                            </div>
                            <div className="space-y-1 mb-6">
                                <span className="font-sans text-[10px] text-cream/60">Estimated Cost Per Wear</span>
                                <div className="font-mono text-3xl text-rust tracking-tighter">$14.50</div>
                            </div>
                            <div className="bg-white/5 rounded p-3 border border-white/10">
                                <h5 className="font-sans text-xs font-semibold mb-1">Trend Decay</h5>
                                <p className="font-sans text-[10px] text-cream/70 mb-3">Aesthetic fading. Out of style in 4 mos.</p>
                                <button className="w-full py-1.5 bg-cream text-charcoal text-[10px] font-semibold rounded">Find Alternative</button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

            </div>

            {/* Feature 2: The Dashboard */}
            <div className="max-w-[1200px] mx-auto w-full px-4 flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-24">

                {/* UI: Left */}
                <div className="lg:w-2/3 w-full bg-[#f0eee6] rounded-[2rem] p-8 md:p-12 h-[500px] relative overflow-hidden flex items-center justify-center border border-charcoal/5">

                    {/* Floating Dashboard Elements */}
                    <div className="relative w-full h-full">
                        <motion.div style={{ y: y2 }} className="absolute top-4 left-0 right-12 z-10 w-full max-w-[400px] rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] bg-white border border-slate-200/50">
                            <GaugeWidget />
                        </motion.div>

                        <motion.div style={{ y: y1 }} className="absolute bottom-4 right-0 z-20 w-full max-w-[350px] rounded-2xl shadow-[0_30px_50px_-15px_rgba(0,0,0,0.1)] bg-white border border-slate-200/50">
                            <FiberBarWidget />
                        </motion.div>
                    </div>

                </div>

                {/* Text: Right */}
                <div className="lg:w-1/3 flex flex-col justify-start">
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-charcoal/5 text-charcoal/60 px-3 py-1.5 rounded-full w-max mb-6">Analyze</span>
                    <h3 className="font-sans text-3xl md:text-5xl font-medium leading-tight tracking-tight mb-6">
                        Unlock material intelligence
                    </h3>
                    <p className="font-sans text-charcoal/70 leading-relaxed mb-8">
                        Power conscious consumption, cut overspending, and improve personal style longevity with deep fiber analysis and micro-plastic detection.
                    </p>

                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-white border border-charcoal/10 flex items-center justify-center shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-sans font-medium text-charcoal mb-1">Extensive parameter network</h4>
                                <p className="font-sans text-sm text-charcoal/60">Cross-reference garments against 40+ sustainability and ethics databases.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-white border border-charcoal/10 flex items-center justify-center shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-sans font-medium text-charcoal mb-1">Smart scoring</h4>
                                <p className="font-sans text-sm text-charcoal/60">Automatically calculate overall lifespan and durability based on historical product data.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </section>
    );
}
