"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GaugeWidget } from "@/components/dashboard/GaugeWidget";
import { FiberBarWidget, GarmentData } from "@/components/dashboard/FiberBarWidget";
import { CheckCircle, Database, Robot, FileCode } from "@phosphor-icons/react";
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
export function InteractiveDashboardMock({ activeFeature = 0 }: { activeFeature?: number }) {
    // Feature 2 animation state
    const [isClean, setIsClean] = useState(false);
    useEffect(() => {
        setTimeout(() => setIsClean(false), 0);
        if (activeFeature === 2) {
            const timer = setTimeout(() => setIsClean(true), 2500);
            return () => clearTimeout(timer);
        }
    }, [activeFeature]);
    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-white/50 backdrop-blur-sm relative overflow-hidden">
            <AnimatePresence mode="wait">
                {/* FEATURE 0: Parameter Network */}
                {activeFeature === 0 && (
                    <motion.div
                        key="feat-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-lg flex flex-col items-center gap-8 relative"
                    >
                        {/* Fake connecting databases */}
                        <div className="flex justify-between w-full max-w-[300px] mb-4">
                            <motion.div
                                className="flex flex-col items-center gap-2"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-charcoal/10"><Database className="w-5 h-5 text-charcoal/60" /></div>
                                <span className="text-[9px] font-mono text-charcoal/40 uppercase">Certifications</span>
                            </motion.div>
                            <motion.div
                                className="flex flex-col items-center gap-2 mt-8"
                                animate={{ y: [0, 5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-charcoal/10"><Robot className="w-5 h-5 text-charcoal/60" /></div>
                                <span className="text-[9px] font-mono text-charcoal/40 uppercase">LCA Models</span>
                            </motion.div>
                            <motion.div
                                className="flex flex-col items-center gap-2"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-charcoal/10"><Database className="w-5 h-5 text-charcoal/60" /></div>
                                <span className="text-[9px] font-mono text-charcoal/40 uppercase">Supply Chain</span>
                            </motion.div>
                        </div>
                        {/* Animated connecting lines (CSS simulation for neatness) */}
                        <div className="absolute top-[3.5rem] bottom-0 left-0 right-0 w-full flex justify-center -z-10 opacity-20 hidden">
                            {/* SVG could go here, omitting for layout simplicity, conveying the network via visual stagger instead */}
                        </div>
                        <motion.div
                            layoutId="fiberbar-card"
                            className="w-full rounded-[1.5rem] bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] border border-charcoal/[0.04] overflow-hidden"
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        >
                            <FiberBarWidget garment={GARMENTS[1]} />
                        </motion.div>
                    </motion.div>
                )}
                {/* FEATURE 1: Smart Scoring */}
                {activeFeature === 1 && (
                    <motion.div
                        key="feat-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md flex flex-col items-center"
                    >
                        <motion.div
                            layoutId="gauge-card"
                            className="w-full rounded-[2rem] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] border border-charcoal/[0.04] overflow-hidden"
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        >
                            <GaugeWidget score={GARMENTS[1].score} trendFeed={GARMENTS[1].trendFeed} />
                        </motion.div>
                    </motion.div>
                )}
                {/* FEATURE 2: Data Quality Resolution */}
                {activeFeature === 2 && (
                    <motion.div
                        key="feat-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-lg relative min-h-[250px] flex items-center justify-center"
                    >
                        <AnimatePresence mode="wait">
                            {!isClean ? (
                                <motion.div
                                    key="messy-json"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-charcoal text-green-400 font-mono text-xs p-6 rounded-xl shadow-2xl w-full border border-charcoal/20"
                                >
                                    <div className="flex items-center gap-2 mb-4 opacity-50 text-white">
                                        <FileCode className="w-4 h-4" /> Raw Scrape Payload
                                        <motion.div
                                            animate={{ opacity: [1, 0, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="w-2 h-2 bg-green-500 rounded-full ml-auto"
                                        />
                                    </div>
                                    <pre className="whitespace-pre-wrap leading-loose">
                                        {`{
  "product_id": "84x-992",
  "name": "PREMIUM KNIT CREW",
  "materials_raw": "Made w/ 60% cotton n some recycled stuff (40%)",
  "country_origin": "uknw",
  "sustainability_tags": ["eco-friendly??", "green"]
}`}
                                    </pre>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="clean-widget"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                    className="w-full relative"
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#4A6741]/10 text-[#4A6741] px-4 py-1.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest border border-[#4A6741]/20">
                                        <CheckCircle weight="fill" className="w-4 h-4" /> Data Standardized
                                    </div>
                                    <motion.div
                                        layoutId="fiberbar-card"
                                        className="w-full rounded-[1.5rem] bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] border border-charcoal/[0.04] overflow-hidden"
                                    >
                                        <FiberBarWidget garment={GARMENTS[1]} />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}