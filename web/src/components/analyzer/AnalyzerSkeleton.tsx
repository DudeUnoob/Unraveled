"use client";

import { motion } from "framer-motion";

export function AnalyzerSkeleton() {
    return (
        <div className="w-full flex flex-col gap-12">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-forest/5">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-forest/5 animate-pulse" />
                        <div className="w-32 h-3 bg-charcoal/5 rounded-full animate-pulse" />
                    </div>
                    <div className="w-3/4 h-12 bg-charcoal/5 rounded-2xl animate-pulse" />
                    <div className="w-full h-4 bg-charcoal/5 rounded-full animate-pulse" />
                </div>
                <div className="flex gap-3">
                    <div className="w-32 h-12 rounded-full bg-forest/5 animate-pulse" />
                    <div className="w-32 h-12 rounded-full bg-forest/5 animate-pulse" />
                </div>
            </div>

            {/* Bento Grid Row 1 Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-7 h-[400px] rounded-[2.5rem] bg-white/40 border border-forest/5 p-10 flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <div className="w-40 h-4 bg-charcoal/5 rounded-full" />
                        <div className="w-24 h-8 bg-forest/5 rounded-full" />
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full border-8 border-charcoal/5 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <div className="w-full h-2 bg-charcoal/5 rounded-full" />
                        <div className="w-full h-2 bg-charcoal/5 rounded-full" />
                    </div>
                </div>

                <div className="lg:col-span-5 h-[400px] rounded-[2.5rem] bg-white/40 border border-forest/5 p-10 flex flex-col justify-between">
                    <div className="w-32 h-4 bg-charcoal/5 rounded-full" />
                    <div className="w-full h-1 bg-charcoal/5 rounded-full" />
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <div className="w-16 h-3 bg-charcoal/5 rounded-full" />
                            <div className="w-20 h-8 bg-charcoal/5 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <div className="w-16 h-3 bg-charcoal/5 rounded-full" />
                            <div className="w-20 h-8 bg-charcoal/5 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bento Grid Row 2 Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-12 h-[320px] rounded-[2.5rem] bg-white/40 border border-forest/5 p-10">
                    <div className="flex justify-between mb-8">
                        <div className="w-40 h-4 bg-charcoal/5 rounded-full" />
                        <div className="flex gap-4">
                            <div className="w-12 h-3 bg-charcoal/5 rounded-full" />
                            <div className="w-12 h-3 bg-charcoal/5 rounded-full" />
                        </div>
                    </div>
                    <div className="w-full h-40 bg-charcoal/[0.02] rounded-xl relative overflow-hidden">
                        <motion.div 
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
