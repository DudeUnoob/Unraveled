"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { InteractiveExtensionMock } from "./InteractiveExtensionMock";
import { InteractiveDashboardMock } from "./InteractiveDashboardMock";

export function ProductJourney() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Parallax subtle shifts for left/right text blocks to make the scroll feel alive
    const textY1 = useTransform(scrollYProgress, [0, 1], [30, -30]);
    const textY2 = useTransform(scrollYProgress, [0, 1], [30, -30]);

    return (
        <section ref={containerRef} className="w-full bg-[#f6f5f1] text-charcoal py-32 md:py-48 flex flex-col gap-48">

            {/* Feature 1: The AI Overlay (Extension) */}
            <div className="max-w-[1200px] mx-auto w-full px-4 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                {/* Text: Left */}
                <motion.div style={{ y: textY1 }} className="lg:w-1/3 flex flex-col justify-start">
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
                </motion.div>

                {/* UI: Right - Interactive Extension Mock */}
                <div className="lg:w-2/3 w-full bg-[#e8e6df] rounded-[2rem] p-4 md:p-12 min-h-[500px] flex items-center justify-center border border-charcoal/5 relative z-10">
                    <InteractiveExtensionMock />
                </div>

            </div>

            {/* Feature 2: The Dashboard */}
            <div className="max-w-[1200px] mx-auto w-full px-4 flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-24">

                {/* UI: Left - Interactive Dashboard Mock */}
                <div className="lg:w-2/3 w-full bg-[#f0eee6] rounded-[2rem] p-0 md:p-4 min-h-[500px] flex items-center justify-center border border-charcoal/5 relative z-10 overflow-hidden">
                    <InteractiveDashboardMock />
                </div>

                {/* Text: Right */}
                <motion.div style={{ y: textY2 }} className="lg:w-1/3 flex flex-col justify-start">
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
                </motion.div>

            </div>

        </section>
    );
}
