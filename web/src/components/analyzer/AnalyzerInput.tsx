"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, LinkSimple, ImageSquare, ArrowRight, Warning, CurrencyDollar } from "@phosphor-icons/react";

interface AnalyzerInputProps {
    onAnalyze: (query: string, inputType: string, price?: number) => void;
    isLoading: boolean;
    error: string | null;
    initialQuery?: string;
    initialPrice?: number;
    autoTrigger?: boolean;
}

type InputMode = "text" | "url";

export function AnalyzerInput({
    onAnalyze,
    isLoading,
    error,
    initialQuery = "",
    initialPrice,
    autoTrigger = false,
}: AnalyzerInputProps) {
    const [query, setQuery] = useState(initialQuery);
    const [inputMode, setInputMode] = useState<InputMode>("text");
    const [price, setPrice] = useState<string>(initialPrice ? String(initialPrice) : "");
    const [showPrice, setShowPrice] = useState(Boolean(initialPrice));
    const inputRef = useRef<HTMLInputElement>(null);
    const hasAutoTriggered = useRef(false);

    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
        }
    }, [initialQuery]);

    useEffect(() => {
        if (initialPrice) {
            setPrice(String(initialPrice));
            setShowPrice(true);
        }
    }, [initialPrice]);

    useEffect(() => {
        if (autoTrigger && initialQuery && !hasAutoTriggered.current) {
            hasAutoTriggered.current = true;
            const p = initialPrice || (price ? parseFloat(price) : undefined);
            onAnalyze(initialQuery, "text", p);
        }
    }, [autoTrigger, initialQuery, initialPrice, onAnalyze, price]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;
        const p = price ? parseFloat(price) : undefined;
        onAnalyze(query.trim(), inputMode, p && p > 0 ? p : undefined);
    };

    const placeholders: Record<InputMode, string> = {
        text: "barrel leg jeans, mesh ballet flats, butter yellow...",
        url: "https://www.zara.com/us/en/product-page.html",
    };

    return (
        <div className="w-full">
            {/* Input Mode Tabs */}
            <div className="flex items-center gap-1 mb-4">
                <button
                    type="button"
                    onClick={() => setInputMode("text")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 ${inputMode === "text"
                        ? "bg-charcoal text-cream"
                        : "text-charcoal/50 hover:text-charcoal/80"
                        }`}
                >
                    <MagnifyingGlass weight="bold" className="w-3.5 h-3.5" />
                    Text
                </button>
                <button
                    type="button"
                    onClick={() => setInputMode("url")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 ${inputMode === "url"
                        ? "bg-charcoal text-cream"
                        : "text-charcoal/50 hover:text-charcoal/80"
                        }`}
                >
                    <LinkSimple weight="bold" className="w-3.5 h-3.5" />
                    URL
                </button>
                <button
                    type="button"
                    disabled
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-medium text-charcoal/25 cursor-not-allowed"
                >
                    <ImageSquare weight="bold" className="w-3.5 h-3.5" />
                    Image
                    <span className="text-[9px] uppercase tracking-wider text-charcoal/30 font-semibold ml-1">Soon</span>
                </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative w-full">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type={inputMode === "url" ? "url" : "text"}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholders[inputMode]}
                        disabled={isLoading}
                        className="w-full py-4 pl-5 pr-36 bg-charcoal/[0.04] border border-charcoal/10 rounded-2xl font-sans text-base text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10 transition-all duration-300 disabled:opacity-50"
                    />

                    <motion.button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-2.5 bg-charcoal text-cream rounded-xl font-sans text-sm font-medium disabled:opacity-30 transition-colors hover:bg-forest"
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full"
                            />
                        ) : (
                            <ArrowRight weight="bold" className="w-4 h-4" />
                        )}
                        {isLoading ? "Analyzing" : "Analyze"}
                    </motion.button>
                </div>

                {/* Price toggle + input */}
                <AnimatePresence>
                    {showPrice ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="relative">
                                <CurrencyDollar weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Price (optional — for CPW analysis)"
                                    disabled={isLoading}
                                    className="w-full py-3 pl-9 pr-20 bg-charcoal/[0.04] border border-charcoal/[0.08] rounded-xl font-mono text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-forest/30 focus:ring-1 focus:ring-forest/10 transition-all duration-300 disabled:opacity-50 tabular-nums"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setShowPrice(false); setPrice(""); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-charcoal/30 uppercase tracking-wider hover:text-charcoal/60 transition-colors"
                                >
                                    Hide
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            type="button"
                            onClick={() => setShowPrice(true)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-1.5 mt-3 font-mono text-[10px] text-charcoal/35 uppercase tracking-wider hover:text-charcoal/60 transition-colors"
                        >
                            <CurrencyDollar weight="bold" className="w-3 h-3" />
                            Add price for CPW analysis
                        </motion.button>
                    )}
                </AnimatePresence>
            </form>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-rust/8 border border-rust/15 rounded-xl"
                    >
                        <Warning weight="fill" className="w-4 h-4 text-rust shrink-0" />
                        <span className="font-sans text-sm text-rust/90">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Helper text */}
            <p className="mt-3 font-sans text-xs text-charcoal/35 max-w-md">
                Enter a product name, style keyword, or fashion trend to see its projected lifespan and real cost per wear.
            </p>
        </div>
    );
}
