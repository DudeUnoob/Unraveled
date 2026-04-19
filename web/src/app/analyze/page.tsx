"use client";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
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
        <main className="flex min-h-[100dvh] flex-col items-center w-full overflow-hidden bg-cream relative text-charcoal selection:bg-forest/30">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none w-full h-full">
                <div 
                    className="absolute inset-0 w-full h-full opacity-40 mix-blend-multiply" 
                    style={{ 
                        backgroundImage: 'url(/analyze/bg-leaf.png)',
                        backgroundSize: '400px',
                        backgroundRepeat: 'repeat'
                    }} 
                />
            </div>
            <div className="relative z-10 w-full max-w-[1200px] px-4 md:px-8 pt-32 pb-32">
                <div className="bg-white rounded-[40px] shadow-sm border border-forest/10 p-8 md:p-12 lg:p-16 flex flex-col items-center w-full relative overflow-hidden">
                    
                    {/* Hero Section */}
                    <div className="w-full flex flex-col items-center text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-[48px] font-bold text-forest leading-tight mb-6">
                                When does this trend die?
                            </h1>
                            <p className="font-serif text-lg md:text-xl text-forest/80 max-w-[900px] mx-auto leading-relaxed">
                                Enter a product, style, or fashion keyword. We pull real search data,
                                fit a decay model, and project exactly when the trend flatlines.
                            </p>
                        </motion.div>
                    </div>
                    {/* Product Images Row */}
                    <div className="w-full mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-[1000px] mx-auto flex items-center justify-center gap-6 md:gap-10"
                        >
                            <div className="w-[300px] h-[380px] shrink-0 overflow-hidden relative">
                                <img
                                    src="/hero-product-1.png"
                                    alt="Green t-shirt"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-[300px] h-[360px] shrink-0 overflow-hidden relative">
                                <img
                                    src="/hero-product-2.png"
                                    alt="Blue t-shirt"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-[300px] h-[290px] shrink-0 overflow-hidden relative hidden md:block">
                                <img
                                    src="/hero-product-3.png"
                                    alt="Yellow t-shirt"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>
                    </div>
                    {/* Search Bar Section */}
                    <div className="w-full mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-[1000px] mx-auto"
                        >
                            <div className="bg-[#dce2c5] border-2 border-forest rounded-[20px] p-6 shadow-sm">
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
                    </div>
                    {/* Results Area */}
                    <div className="w-full max-w-[1000px] mx-auto z-10 relative min-h-[400px]">
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
                                    className="mt-8"
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
                                    className="mt-8"
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
                </div>
            </div>
            {/* Wavy Footer Area */}
            <div className="relative w-full z-10 mt-auto">
                <img src="/analyze/footer-wave.png" alt="" className="w-full h-auto min-h-[120px] object-cover object-top" />
                <div className="bg-forest w-full pb-20 pt-8 relative">
                    <div className="max-w-[800px] mx-auto text-center text-white z-10 relative">
                        <h2 className="font-serif text-5xl md:text-6xl font-bold mb-4 tracking-wide">UNRAVELED</h2>
                        <p className="font-sans text-xl md:text-2xl font-bold max-w-[600px] mx-auto leading-tight mb-8">
                            Empowering consumers with material truth.<br/>
                            End the cycle of fast fashion.
                        </p>
                        <button className="bg-white text-forest font-bold text-xl px-10 py-4 rounded-full hover:bg-cream transition-colors">
                            Get Extension Now
                        </button>
                    </div>
                    {/* Decorative Stars */}
                    <img src="/analyze/star-blue.png" className="absolute bottom-10 right-10 w-32 h-auto hidden md:block opacity-80" alt="" />
                    <img src="/analyze/star-green.png" className="absolute bottom-24 right-32 w-24 h-auto hidden md:block opacity-80" alt="" />
                    <img src="/analyze/star-orange.png" className="absolute bottom-10 left-10 w-28 h-auto hidden md:block opacity-80" alt="" />
                    <img src="/analyze/star-green.png" className="absolute bottom-32 left-32 w-20 h-auto hidden md:block opacity-80" alt="" />
                </div>
            </div>
        </main>
    );
}
export default function AnalyzePage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-[100dvh] flex-col items-center w-full bg-cream">
                    
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