"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnalyzerInput } from "@/components/analyzer/AnalyzerInput";
import { TrendResults } from "@/components/analyzer/TrendResults";
import { AnalyzerSkeleton } from "@/components/analyzer/AnalyzerSkeleton";
import { AnalyzerEmptyState } from "@/components/analyzer/AnalyzerEmptyState";
import { useAnalyze } from "@/hooks/useAnalyze";
import type { ExtensionData } from "@/types/analysis";

function parseExtensionData(params: URLSearchParams): ExtensionData | null {
    if (params.get("source") !== "extension") return null;

    const score = parseFloat(params.get("sustainability_score") ?? "0");
    const grade = params.get("sustainability_grade") ?? "";

    const productName = params.get("product_name") ?? "";
    if (!productName) return null;

    return {
        productName,
        productUrl: params.get("product_url") ?? params.get("url") ?? "",
        brand: params.get("brand") ?? "Unknown",
        price: params.get("price") ? parseFloat(params.get("price")!) : null,
        currency: params.get("currency") ?? "USD",
        sustainabilityScore: isNaN(score) ? 0 : score,
        sustainabilityGrade: grade,
        trendLabel: params.get("trend_label") ?? "",
        trendLifespanWeeks: parseInt(params.get("trend_lifespan_weeks") ?? "0", 10),
        cpw: parseFloat(params.get("cpw") ?? "0"),
        cpwAdjusted: parseFloat(params.get("cpw_adjusted") ?? "0"),
        healthLabel: params.get("health_label") ?? "Safe",
        fiberComposition: params.get("fiber_composition") ?? "",
        brandRatingSources: params.get("brand_rating_sources") ?? "",
        fiberDurabilityWears: parseInt(params.get("fiber_durability_wears") ?? "0", 10),
    };
}

function AnalyzerContent() {
    const searchParams = useSearchParams();
    const { state, data, error, price: analyzedPrice, wearsPerWeek, analyze } = useAnalyze();

    const extensionData = useMemo(
        () => parseExtensionData(searchParams),
        [searchParams]
    );

    const isFromExtension = extensionData !== null;
    const initialQuery = extensionData?.productName ?? searchParams.get("product_name") ?? "";
    const initialPrice = extensionData?.price ?? undefined;

    return (
        <main className="flex min-h-[100dvh] flex-col items-center w-full overflow-hidden bg-cream text-charcoal selection:bg-forest/30">
            <Navbar />

            {/* Hero Section - Centered */}
            <section className="w-full pt-32 pb-8 px-6 lg:px-12">
                <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-forest leading-tight mb-4">
                            When does this trend die?
                        </h1>
                        <p className="font-serif text-lg md:text-xl text-forest/70 max-w-[800px] mx-auto leading-relaxed">
                            Enter a product, style, or fashion keyword. We pull real search data,
                            fit a decay model, and project exactly when the trend flatlines.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Product Images Row */}
            <section className="w-full px-6 lg:px-12 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-[1100px] mx-auto flex items-center justify-center gap-8 md:gap-12"
                >
                    <div className="w-[260px] h-[350px] shrink-0 overflow-hidden rounded-lg">
                        <img
                            src="/hero-product-1.png"
                            alt="Fashion trend example"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="w-[260px] h-[330px] shrink-0 overflow-hidden rounded-lg">
                        <img
                            src="/hero-product-2.png"
                            alt="Fashion trend example"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="w-[260px] h-[270px] shrink-0 overflow-hidden rounded-lg hidden md:block">
                        <img
                            src="/hero-product-3.png"
                            alt="Fashion trend example"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Search Bar Section - Green Container */}
            <section className="w-full px-6 lg:px-12 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-[1100px] mx-auto"
                >
                    <div className="bg-forest-light border-3 border-forest rounded-[20px] p-8">
                        <AnalyzerInput
                            onAnalyze={analyze}
                            onImageAnalyzed={(query, brand) => analyze(query, "image", undefined, undefined, brand)}
                            isLoading={state === "loading"}
                            error={error}
                            initialQuery={initialQuery}
                            initialPrice={initialPrice ?? undefined}
                            autoTrigger={isFromExtension && Boolean(initialQuery)}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Results Area */}
            <section className="w-full flex-1 px-6 lg:px-12 pb-32 z-10 relative">
                <div className="max-w-[1100px] mx-auto">
                    <AnimatePresence mode="wait">
                        {state === "idle" && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AnalyzerEmptyState />
                            </motion.div>
                        )}

                        {state === "loading" && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                                className="mt-12"
                            >
                                <AnalyzerSkeleton />
                            </motion.div>
                        )}

                        {state === "success" && data && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="mt-12"
                            >
                                <TrendResults
                                    data={data}
                                    extensionData={extensionData}
                                    price={analyzedPrice ?? initialPrice}
                                    wearsPerWeek={wearsPerWeek}
                                />
                            </motion.div>
                        )}

                        {state === "error" && !data && (
                            <motion.div
                                key="error-empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AnalyzerEmptyState />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            <Footer />
        </main>
    );
}

export default function AnalyzePage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-[100dvh] flex-col items-center w-full bg-cream">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-forest/10 border-t-forest rounded-full animate-spin" />
                    </div>
                </main>
            }
        >
            <AnalyzerContent />
        </Suspense>
    );
}
