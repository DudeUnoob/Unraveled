"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { TrendAnalysisResponse, ExtensionData } from "@/types/analysis";
import { TrendLifespanBar } from "./TrendLifespanBar";
import { DecayCurveChart } from "./DecayCurveChart";
import { ShareButton } from "./ShareButton";
import { AlternativesSection } from "./AlternativesSection";
import { ExtensionDataBanner } from "./ExtensionDataBanner";
import { SustainabilityScore } from "./SustainabilityScore";
import { BookmarkSimple, Info } from "@phosphor-icons/react";
import { useUser } from "@/hooks/useUser";
import { useSavedAnalyses } from "@/hooks/useSavedAnalyses";

interface TrendResultsProps {
    data: TrendAnalysisResponse;
    extensionData?: ExtensionData | null;
    price?: number;
    wearsPerWeek?: number;
}

function getPhaseColor(label: string): string {
    switch (label) {
        case "Timeless": return "#2C4A3E";
        case "Trending": return "#5c6c47";
        case "Fading": return "#C84B31";
        case "Dead": return "#1C1C1C";
        default: return "#5c6c47";
    }
}

function getPhaseVerdict(label: string, weeksRemaining: number): string {
    switch (label) {
        case "Timeless":
            return "This style has shown consistent, stable interest for over a year. Buy with confidence.";
        case "Trending":
            return `Currently growing or near peak interest. Approximately ${weeksRemaining} weeks of strong relevance projected.`;
        case "Fading":
            return `This trend peaked and is declining. Roughly ${weeksRemaining} weeks of relevance remain before it feels dated.`;
        case "Dead":
            return "Interest has collapsed below viability. You may get very few wears before this feels obsolete.";
        default:
            return "Trend analysis complete.";
    }
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as const
        }
    }
};

export const TrendResults = memo(function TrendResults({
    data,
    extensionData,
}: TrendResultsProps) {
    const phaseColor = getPhaseColor(data.trend_lifespan.label);
    const verdict = getPhaseVerdict(
        data.trend_lifespan.label,
        data.trend_lifespan.weeks_remaining
    );
    const isFallback = data.trend_curve.model_type === "keyword_fallback"
        || !data.data_sources.google_trends.available;

    const { user } = useUser();
    const { isSaved, save, unsave } = useSavedAnalyses();
    const bookmarked = isSaved(data.analysis_id);

    const handleBookmark = async () => {
        if (bookmarked) {
            await unsave(data.analysis_id);
        } else {
            await save(data.analysis_id, data.query_normalized, data.trend_lifespan.label);
        }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full flex flex-col gap-12"
        >
            {/* Header / Verdict Section */}
            <motion.div variants={itemVariants} className="w-full pb-12 mb-8 border-b border-forest/10">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Product Image (if available) */}
                    {extensionData && extensionData.productUrl && (
                        <div className="w-[240px] shrink-0">
                            {/* Placeholder for actual product image logic. We use a placeholder matching the design's aspect ratio */}
                            <div className="w-[180px] h-[240px] bg-forest/5 rounded-2xl overflow-hidden border-2 border-forest">
                                <img src="/hero-product-1.png" className="w-full h-full object-cover" alt="Product" />
                            </div>
                        </div>
                    )}
                    
                    {/* Header Info */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col gap-1">
                                {(extensionData?.brand || data.brand_info?.name) && (
                                    <span className="font-serif text-[18px] text-[#5c6c47] uppercase tracking-wide">
                                        {extensionData?.brand || data.brand_info?.name}
                                    </span>
                                )}
                                <div className="flex flex-wrap items-center gap-4">
                                    <h2 className="font-serif text-4xl font-bold text-[#5c6c47]">
                                        {extensionData?.productName || data.query_normalized}
                                    </h2>
                                    <div className="px-5 py-1.5 bg-[#d494ac] text-white rounded-full font-serif text-[20px] font-bold">
                                        {data.trend_lifespan.label.toLowerCase()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {user && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleBookmark}
                                        className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#dce2c5] text-forest font-sans text-xs font-bold transition-colors"
                                    >
                                        <BookmarkSimple weight={bookmarked ? "fill" : "bold"} className="w-4 h-4" />
                                        {bookmarked ? "Saved" : "Save"}
                                    </motion.button>
                                )}
                                <ShareButton shareableUrl={data.shareable_url} />
                            </div>
                        </div>
                        <p className="font-serif text-2xl text-[#5c6c47] leading-relaxed max-w-[800px] mt-4">
                            {verdict}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Extension Data Banner (If active) */}
            {extensionData && (
                <motion.div variants={itemVariants}>
                    <ExtensionDataBanner extensionData={extensionData} />
                </motion.div>
            )}

            {/* Warning Callout */}
            {isFallback && (
                <motion.div
                    variants={itemVariants}
                    className="flex items-start gap-4 p-6 rounded-[1.5rem] bg-rust/5 border border-rust/10"
                >
                    <Info weight="fill" className="w-6 h-6 text-rust shrink-0 mt-0.5" />
                    <p className="font-sans text-sm text-rust/80 leading-relaxed">
                        {data.data_sources.google_trends.serp_key_configured === false
                            ? "Real-time trend data unavailable. Metrics below are keyword-based estimates, not derived from Google Trends."
                            : "Google Trends has insufficient data for this specific query. Metrics below are keyword-based estimates — try a broader search term for live analysis."}
                    </p>
                </motion.div>
            )}

            {/* Main Content Area - Vertically Stacked */}
            <div className="w-full flex flex-col gap-12">
                 {/* Sustainability Score */}
                <motion.div variants={itemVariants} className="w-full">
                    <SustainabilityScore
                        extensionData={extensionData}
                        trendLabel={data.trend_lifespan.label}
                        weeksRemaining={data.trend_lifespan.weeks_remaining}
                        brandInfo={data.brand_info}
                    />
                </motion.div>

                <div className="w-full h-px bg-forest/10" />

                {/* Trend Lifespan Stats */}
                <motion.div variants={itemVariants} className="w-full">
                    <TrendLifespanBar lifespan={data.trend_lifespan} />
                </motion.div>

                {/* Decay Curve Chart */}
                <motion.div variants={itemVariants} className="w-full bg-[#eaf1d7] rounded-[20px] p-8 md:p-12 shadow-sm border border-[#5c6c47]/10">
                    <DecayCurveChart curve={data.trend_curve} phaseColor={phaseColor} data_sources={data.data_sources} />
                </motion.div>

                {/* Sustainable Alternatives */}
                <motion.div variants={itemVariants} className="w-full pt-12 border-t border-forest/10">
                    <AlternativesSection
                        query={data.query_normalized}
                        trendLabel={data.trend_lifespan.label}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
});
