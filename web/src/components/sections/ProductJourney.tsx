"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { InteractiveExtensionMock } from "./InteractiveExtensionMock";
import { InteractiveDashboardMock } from "./InteractiveDashboardMock";
import { ArrowRight, Lightning, Money, HardDrives, ChartLineUp } from "@phosphor-icons/react";

export function ProductJourney() {
    return (
        <section className="w-full bg-white text-charcoal py-32 flex flex-col gap-32 border-b border-charcoal/5">

            {/* Feature 1: The AI Overlay (Extension) */}
            <div className="max-w-[1000px] mx-auto w-full px-4 flex flex-col gap-12">

                {/* Section Header */}
                <div className="w-full flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex flex-col items-start max-w-2xl">
                        <span className="font-mono text-[10px] uppercase tracking-widest bg-charcoal/5 text-charcoal/60 px-3 py-1.5 rounded-full mb-6">Intercept</span>
                        <h3 className="font-sans text-[2.25rem] md:text-[3rem] font-medium leading-[1.1] tracking-tight mb-4">
                            Drive better decisions with Unravel Engine
                        </h3>
                        <p className="font-sans text-[14px] md:text-[16px] text-charcoal/60 leading-relaxed pr-4">
                            High-converting sustainable shopping journeys, completely seamless.
                        </p>
                    </div>
                    <button className="hidden md:flex items-center gap-1.5 px-5 py-2.5 border border-charcoal/20 rounded-full font-sans text-[13px] font-medium text-charcoal transition-colors hover:bg-charcoal/5 self-start mt-10">
                        Explore <ArrowRight weight="bold" className="w-3 h-3" />
                    </button>
                </div>

                {/* Section Content: Image Left, Features Right */}
                <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* UI: Left - Interactive Extension Mock */}
                    <div className="lg:w-[55%] w-full bg-[#f6f5f1] rounded-[1rem] p-4 md:p-12 min-h-[450px] flex items-center justify-center relative z-10 border border-charcoal/[0.03]">
                        <InteractiveExtensionMock />
                    </div>

                    {/* Features: Right */}
                    <div className="lg:w-[45%] flex flex-col justify-center gap-8 py-4">
                        {/* Feature Item 1 (Highlighted block) */}
                        <div className="bg-charcoal/[0.03] rounded-xl p-6">
                            <div className="flex gap-4 items-start">
                                <Lightning weight="duotone" className="w-6 h-6 text-charcoal shrink-0" />
                                <div>
                                    <h4 className="font-sans text-[16px] font-semibold text-charcoal mb-2">Instant telemetry</h4>
                                    <p className="font-sans text-[14px] text-charcoal/60 leading-relaxed">Translate material data and trend velocity into actionable insight instantly while browsing.</p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Item 2 */}
                        <div className="px-6">
                            <div className="flex gap-4 items-start">
                                <Money weight="duotone" className="w-6 h-6 text-charcoal shrink-0" />
                                <div>
                                    <h4 className="font-sans text-[16px] font-semibold text-charcoal mb-2">Cost Per Wear Projection</h4>
                                </div>
                            </div>
                        </div>

                        {/* Feature Item 3 */}
                        <div className="px-6">
                            <div className="flex gap-4 items-start">
                                <HardDrives weight="duotone" className="w-6 h-6 text-charcoal shrink-0" />
                                <div>
                                    <h4 className="font-sans text-[16px] font-semibold text-charcoal mb-2">First-time-right data collection</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Feature 2: The Dashboard */}
            <div className="max-w-[1000px] mx-auto w-full px-4 flex flex-col gap-12">

                {/* Section Header */}
                <div className="w-full flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex flex-col items-start max-w-2xl">
                        <span className="font-mono text-[10px] uppercase tracking-widest bg-charcoal/5 text-charcoal/60 px-3 py-1.5 rounded-full mb-6">Analyze</span>
                        <h3 className="font-sans text-[2.25rem] md:text-[3rem] font-medium leading-[1.1] tracking-tight mb-4">
                            Unlock material intelligence
                        </h3>
                        <p className="font-sans text-[14px] md:text-[16px] text-charcoal/60 leading-relaxed pr-4">
                            Power conscious consumption, cut overspending, and improve personal style longevity.
                        </p>
                    </div>
                    <button className="hidden md:flex items-center gap-1.5 px-5 py-2.5 border border-charcoal/20 rounded-full font-sans text-[13px] font-medium text-charcoal transition-colors hover:bg-charcoal/5 self-start mt-10">
                        Explore <ArrowRight weight="bold" className="w-3 h-3" />
                    </button>
                </div>

                {/* Section Content: Features Left, Image Right */}
                <div className="w-full flex flex-col-reverse lg:flex-row gap-12 lg:gap-16">

                    {/* Features: Left */}
                    <div className="lg:w-[45%] flex flex-col justify-center gap-8 py-4">
                        {/* Feature Item 1 (Highlighted block) */}
                        <div className="bg-charcoal/[0.03] rounded-xl p-6">
                            <div className="flex gap-4 items-start">
                                <HardDrives weight="duotone" className="w-6 h-6 text-charcoal shrink-0" />
                                <div>
                                    <h4 className="font-sans text-[16px] font-semibold text-charcoal mb-2">Extensive parameter network</h4>
                                    <p className="font-sans text-[14px] text-charcoal/60 leading-relaxed">Cross-reference garments against 40+ sustainability and ethics databases.</p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Item 2 */}
                        <div className="px-6">
                            <div className="flex gap-4 items-start">
                                <ChartLineUp weight="duotone" className="w-6 h-6 text-charcoal shrink-0" />
                                <div>
                                    <h4 className="font-sans text-[16px] font-semibold text-charcoal mb-2">Smart scoring and routing</h4>
                                </div>
                            </div>
                        </div>

                        {/* Feature Item 3 */}
                        <div className="px-6">
                            <div className="flex gap-4 items-start">
                                <Lightning weight="duotone" className="w-6 h-6 text-charcoal shrink-0" />
                                <div>
                                    <h4 className="font-sans text-[16px] font-semibold text-charcoal mb-2">Low data quality resolved</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* UI: Right - Interactive Dashboard Mock */}
                    <div className="lg:w-[55%] w-full bg-[#f6f5f1] rounded-[1rem] p-0 md:p-4 min-h-[450px] flex items-center justify-center relative z-10 overflow-hidden border border-charcoal/[0.03]">
                        <InteractiveDashboardMock />
                    </div>

                </div>

            </div>

        </section>
    );
}
