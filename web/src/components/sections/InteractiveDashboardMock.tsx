"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GaugeWidget } from "@/components/dashboard/GaugeWidget";
import { FiberBarWidget, GarmentData } from "@/components/dashboard/FiberBarWidget";
import { cn } from "@/lib/utils";

const GARMENTS: (GarmentData & { trendFeed: string })[] = [
    {
        name: "Fast Fashion Blouse",
        score: 24,
        trendFeed: "Viral Corset Top — Peaked 3 wks ago · Est. 5 wears · $9.00/wear",
        fibers: [
            { name: "Polyester", percent: 85, color: "bg-rust" },
            { name: "Elastane", percent: 15, color: "bg-charcoal/60" }
        ]
    },
    {
        name: "Premium Knit Sweater",
        score: 78,
        trendFeed: "Heavyweight Cotton Crew — Classic · Est. 60 wears · $2.50/wear",
        fibers: [
            { name: "Cotton", percent: 60, color: "bg-sage" },
            { name: "Recycled", percent: 40, color: "bg-forest" }
        ]
    },
    {
        name: "Summer Trousers",
        score: 92,
        trendFeed: "Linen Trousers — Timeless · Est. 80 wears · $1.20/wear",
        fibers: [
            { name: "Linen", percent: 100, color: "bg-cream border border-charcoal/10" }
        ]
    },
];

export function InteractiveDashboardMock() {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeGarment = GARMENTS[activeIndex];

    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-8 lg:gap-16 p-6 lg:p-12 items-center justify-center">

            {/* The Left Column (Menu) */}
            <div className="w-full lg:w-1/3 flex flex-col gap-2 justify-center pl-0 lg:pl-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal/40 mb-4 pl-4 font-semibold">Select Item</span>
                {GARMENTS.map((garment, idx) => (
                    <button
                        key={garment.name}
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                            "text-left px-5 py-4 rounded-full font-sans text-[13px] font-semibold transition-all duration-300 flex items-center gap-4 w-full cursor-pointer",
                            activeIndex === idx
                                ? "bg-white text-charcoal shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] border border-charcoal/5"
                                : "text-charcoal/40 hover:text-charcoal pt-[17px] pb-[15px]" // Visual balancing
                        )}
                    >
                        <div className="bg-transparent flex items-center justify-center relative w-3 h-3 shrink-0">
                            {activeIndex === idx && (
                                <motion.div layoutId="active-dot" className="w-[7px] h-[7px] bg-charcoal rounded-full absolute" />
                            )}
                            <div className={cn("w-3 h-3 rounded-full border-[1.5px] transition-colors duration-300 absolute", activeIndex === idx ? "border-transparent" : "border-charcoal/20")} />
                        </div>
                        {garment.name}
                    </button>
                ))}
            </div>

            {/* The Right Column (Widgets) */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6 justify-center max-w-[450px]">

                {/* Top Widget: Gauge */}
                <motion.div
                    layoutId="gauge-card"
                    className="w-full rounded-[2rem] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-charcoal/[0.04] overflow-hidden"
                >
                    <GaugeWidget score={activeGarment.score} trendFeed={activeGarment.trendFeed} />
                </motion.div>

                {/* Bottom Widget: Fiber Bar */}
                <motion.div
                    layoutId="fiberbar-card"
                    className="w-full rounded-[1.5rem] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-charcoal/[0.04] overflow-hidden"
                >
                    <FiberBarWidget garment={activeGarment} />
                </motion.div>

            </div>

        </div>
    );
}
