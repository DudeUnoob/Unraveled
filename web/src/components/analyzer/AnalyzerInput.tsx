"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, LinkSimple, ImageSquare, ArrowRight, Warning } from "@phosphor-icons/react";
import { ImageUploadDropzone } from "./ImageUploadDropzone";

interface AnalyzerInputProps {
    onAnalyze: (query: string, inputType: string) => void;
    onImageAnalyzed?: (query: string) => void;
    isLoading: boolean;
    error: string | null;
    initialQuery?: string;
    initialPrice?: number;
    autoTrigger?: boolean;
}

type InputMode = "text" | "url" | "image";

export function AnalyzerInput({
    onAnalyze,
    onImageAnalyzed,
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
        image: "",
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
                    onClick={() => setInputMode("image")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 ${inputMode === "image"
                            ? "bg-charcoal text-cream"
                            : "text-charcoal/50 hover:text-charcoal/80"
                        }`}
                >
                    <ImageSquare weight="bold" className="w-3.5 h-3.5" />
                    Image
                </button>
            </div>

            {/* Input Form */}
            {inputMode === "image" ? (
                <ImageUploadDropzone
                    onImageAnalyzed={(suggestedQuery) => {
                        setQuery(suggestedQuery);
                        if (onImageAnalyzed) {
                            onImageAnalyzed(suggestedQuery);
                        } else {
                            onAnalyze(suggestedQuery, "image");
                        }
                    }}
                    isLoading={isLoading}
                />
            ) : (
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
                </form>
            )}

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
