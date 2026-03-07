"use client";

import { memo } from "react";
import { motion } from "framer-motion";

export const AnalyzerSkeleton = memo(function AnalyzerSkeleton() {
    return (
        <div className="w-full animate-pulse">
            {/* Verdict skeleton */}
            <div className="flex items-start gap-4 mb-10 pb-8 border-b border-charcoal/[0.06]">
                <div className="w-12 h-12 rounded-2xl bg-charcoal/[0.06]" />
                <div className="flex-1">
                    <div className="h-6 w-48 bg-charcoal/[0.06] rounded-lg mb-2" />
                    <div className="h-4 w-80 bg-charcoal/[0.04] rounded-lg" />
                </div>
            </div>

            {/* Lifespan bar skeleton */}
            <div className="mb-10 pb-10 border-b border-charcoal/[0.06]">
                <div className="flex justify-between mb-6">
                    <div className="h-3 w-24 bg-charcoal/[0.06] rounded" />
                    <div className="h-3 w-16 bg-charcoal/[0.06] rounded" />
                </div>
                <div className="h-2.5 w-full bg-charcoal/[0.04] rounded-full mb-3" />
                <div className="flex justify-between">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-2 w-12 bg-charcoal/[0.04] rounded" />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-charcoal/[0.06]">
                    {[1, 2, 3].map((i) => (
                        <div key={i}>
                            <div className="h-2 w-14 bg-charcoal/[0.04] rounded mb-2" />
                            <div className="h-5 w-10 bg-charcoal/[0.06] rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart skeleton */}
            <div className="mb-10 pb-10 border-b border-charcoal/[0.06]">
                <div className="flex justify-between mb-6">
                    <div className="h-3 w-32 bg-charcoal/[0.06] rounded" />
                    <div className="h-3 w-24 bg-charcoal/[0.04] rounded" />
                </div>
                <div className="h-[280px] w-full bg-charcoal/[0.03] rounded-2xl relative overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-charcoal/[0.03] to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    />
                </div>
            </div>

            {/* Params skeleton */}
            <div>
                <div className="h-3 w-40 bg-charcoal/[0.06] rounded mb-4" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i}>
                            <div className="h-2 w-14 bg-charcoal/[0.04] rounded mb-2" />
                            <div className="h-5 w-10 bg-charcoal/[0.06] rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});
