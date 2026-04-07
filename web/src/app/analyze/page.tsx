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
import { Asterisk } from "@phosphor-icons/react";

function parseExtensionData(params: URLSearchParams): ExtensionData | null {
    if (params.get("source") !== "extension") return null;

    const score = parseFloat(params.get("sustainability_score") ?? "0");
    const grade = params.get("sustainability_grade") ?? "";

    // Need at least a product name to consider it valid extension data
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

    // Parse extension data from URL params
    const extensionData = useMemo(
        () => parseExtensionData(searchParams),
        [searchParams]
    );

    const isFromExtension = extensionData !== null;
    const initialQuery = extensionData?.productName ?? searchParams.get("product_name") ?? "";
    const initialPrice = extensionData?.price ?? undefined;


    return (
        <main className="flex min-h-[100dvh] flex-col items-center w-full overflow-hidden bg-[#f6f5f1] text-charcoal selection:bg-rust/30">
            <Navbar />

            {/* Page Header */}
            <section className="w-full pt-28 pb-8 px-4">
                <div className="max-w-[1100px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 mb-6">
                            <Asterisk weight="bold" className="w-3.5 h-3.5 text-charcoal/30" />
                            <span className="font-mono text-[10px] text-charcoal/30 uppercase tracking-widest">
                                Micro-Trend Death Clock
                            </span>
                        </div>

                        <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-charcoal leading-[1.1] mb-3">
                            When does this{" "}
                            <span className="font-serif italic text-forest">trend</span> die?
                        </h1>
                        <p className="font-sans text-base text-charcoal/45 max-w-xl leading-relaxed mb-8">
                            Enter a product, style, or fashion keyword. We pull real search data,
                            fit a decay model, and project exactly when the trend flatlines.
                        </p>
                    </motion.div>

                    {/* Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-2xl"
                    >
                        <AnalyzerInput
                            onAnalyze={analyze}
                            onImageAnalyzed={(query, brand) => analyze(query, "image", undefined, undefined, brand)}
                            isLoading={state === "loading"}
                            error={error}
                            initialQuery={initialQuery}
                            initialPrice={initialPrice ?? undefined}
                            autoTrigger={isFromExtension && Boolean(initialQuery)}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Results Area */}
            <section className="w-full flex-1 px-4 pb-20">
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
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
                <main className="flex min-h-[100dvh] flex-col items-center w-full bg-[#f6f5f1]">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
                    </div>
                </main>
            }
        >
            <AnalyzerContent />
        </Suspense>
    );
}
