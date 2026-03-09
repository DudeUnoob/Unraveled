"use client";

import { useState } from "react";
import { useScroll, useTransform, motion, AnimatePresence } from "framer-motion";
import { InteractiveExtensionMock } from "./InteractiveExtensionMock";
import { InteractiveDashboardMock } from "./InteractiveDashboardMock";
import { ArrowRight, Lightning, Money, HardDrives, ChartLineUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const EXTENSION_FEATURES = [
    {
        icon: Lightning,
        title: "Instant telemetry",
        desc: "Translate material data and trend velocity into actionable insight instantly while browsing."
    },
    {
        icon: Money,
        title: "Cost Per Wear Projection",
        desc: "Compare lifetime value against sustainable alternatives in real-time."
    },
    {
        icon: HardDrives,
        title: "First-time-right data collection",
        desc: "Seamlessly extract product specs into structured parameter networks."
    }
];

const DASHBOARD_FEATURES = [
    {
        icon: HardDrives,
        title: "Extensive parameter network",
        desc: "Cross-reference garments against 40+ sustainability and ethics databases."
    },
    {
        icon: ChartLineUp,
        title: "Smart scoring and routing",
        desc: "Dynamic ESG calculation and intelligent wardrobe gap analysis."
    },
    {
        icon: Lightning,
        title: "Low data quality resolved",
        desc: "Turn unstructured web data into pristine, actionable material intelligence."
    }
];

export function ProductJourney() {
    const [activeExtensionFeature, setActiveExtensionFeature] = useState(0);
    const [activeDashboardFeature, setActiveDashboardFeature] = useState(0);

    return (
        <section className="w-full bg-white text-charcoal py-32 flex flex-col gap-32 border-b border-charcoal/5">

            {/* Feature 1: The AI Overlay (Extension) */}
            <div className="max-w-[1000px] mx-auto w-full px-4 flex flex-col gap-12">

                {/* Section Header */}
                <div className="w-full flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex flex-col items-start max-w-2xl">
                        <span className="font-mono text-[10px] uppercase tracking-widest bg-charcoal/5 text-charcoal/60 px-3 py-1.5 rounded-full mb-6">Intercept</span>
                        <h3 className="font-sans text-[2.25rem] md:text-[3rem] tracking-[-0.05em] font-normal leading-[1.1] text-[#1b0624] mb-4 text-left">
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
                        <InteractiveExtensionMock activeFeature={activeExtensionFeature} />
                    </div>

                    {/* Features: Right */}
                    <div className="lg:w-[45%] flex flex-col justify-center gap-2 py-4 relative">
                        {EXTENSION_FEATURES.map((feature, idx) => {
                            const Icon = feature.icon;
                            const isActive = activeExtensionFeature === idx;
                            return (
                                <button
                                    key={feature.title}
                                    onClick={() => setActiveExtensionFeature(idx)}
                                    className={cn(
                                        "relative flex gap-4 items-start p-6 rounded-xl text-left transition-colors duration-300 w-full",
                                        isActive ? "text-charcoal" : "text-charcoal/60 hover:text-charcoal hover:bg-charcoal/[0.02]"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="extension-feature-bg"
                                            className="absolute inset-0 bg-charcoal/[0.03] rounded-xl z-0"
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        />
                                    )}
                                    <Icon weight={isActive ? "duotone" : "regular"} className={cn("w-6 h-6 shrink-0 z-10", isActive ? "text-charcoal" : "text-charcoal/40")} />
                                    <div className="z-10">
                                        <h4 className="font-sans text-[16px] font-semibold mb-2">{feature.title}</h4>
                                        <AnimatePresence initial={false}>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="font-sans text-[14px] leading-relaxed pt-1">{feature.desc}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Feature 2: The Dashboard */}
            <div className="max-w-[1000px] mx-auto w-full px-4 flex flex-col gap-12">

                {/* Section Header */}
                <div className="w-full flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex flex-col items-start max-w-2xl">
                        <span className="font-mono text-[10px] uppercase tracking-widest bg-charcoal/5 text-charcoal/60 px-3 py-1.5 rounded-full mb-6">Analyze</span>
                        <h3 className="font-sans text-[2.25rem] md:text-[3rem] tracking-[-0.05em] font-normal leading-[1.1] text-[#1b0624] mb-4 text-left">
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
                    <div className="lg:w-[45%] flex flex-col justify-center gap-2 py-4 relative">
                        {DASHBOARD_FEATURES.map((feature, idx) => {
                            const Icon = feature.icon;
                            const isActive = activeDashboardFeature === idx;
                            return (
                                <button
                                    key={feature.title}
                                    onClick={() => setActiveDashboardFeature(idx)}
                                    className={cn(
                                        "relative flex gap-4 items-start p-6 rounded-xl text-left transition-colors duration-300 w-full",
                                        isActive ? "text-charcoal" : "text-charcoal/60 hover:text-charcoal hover:bg-charcoal/[0.02]"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="dashboard-feature-bg"
                                            className="absolute inset-0 bg-charcoal/[0.03] rounded-xl z-0"
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        />
                                    )}
                                    <Icon weight={isActive ? "duotone" : "regular"} className={cn("w-6 h-6 shrink-0 z-10", isActive ? "text-charcoal" : "text-charcoal/40")} />
                                    <div className="z-10">
                                        <h4 className="font-sans text-[16px] font-semibold mb-2">{feature.title}</h4>
                                        <AnimatePresence initial={false}>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="font-sans text-[14px] leading-relaxed pt-1">{feature.desc}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* UI: Right - Interactive Dashboard Mock */}
                    <div className="lg:w-[55%] w-full bg-[#f6f5f1] rounded-[1rem] p-0 md:p-4 min-h-[450px] flex items-center justify-center relative z-10 overflow-hidden border border-charcoal/[0.03]">
                        <InteractiveDashboardMock activeFeature={activeDashboardFeature} />
                    </div>

                </div>

            </div>

        </section>
    );
}

