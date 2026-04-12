"use client";
import { useState, useEffect, useRef, } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, } from "framer-motion";
import { MagnifyingGlass, LinkSimple, ImageSquare, ArrowRight, Warning } from "@phosphor-icons/react";
import { ImageUploadDropzone } from "./ImageUploadDropzone";
interface AnalyzerInputProps {
    onAnalyze: (query: string, inputType: string, price?: number, wearsPerWeek?: number, brand?: string | null) => void;
    onImageAnalyzed?: (query: string, brand?: string | null) => void;
    isLoading: boolean;
    error: string | null;
    initialQuery?: string;
    initialPrice?: number;
    autoTrigger?: boolean;
}
type InputMode = "text" | "url" | "image";
function MagneticButton({
    children,
    onClick,
    disabled,
    isLoading
}: {
    children?: React.ReactNode,
    onClick?: (e: React.FormEvent) => void,
    disabled?: boolean,
    isLoading?: boolean
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;
        
        // Only pull if within a reasonable range (magnetic effect)
        x.set(distanceX * 0.35);
        y.set(distanceY * 0.35);
    };
    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };
    return (
        <motion.button
            ref={ref}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 mr-2 bg-forest text-forest-light rounded-full font-serif text-base font-bold disabled:opacity-30 transition-colors hover:bg-forest-dark z-10"
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
    );
}
export function AnalyzerInput({
    onAnalyze,
    onImageAnalyzed,
    isLoading,
    error,
    initialQuery = "",
    initialPrice,
    autoTrigger = false,
}: AnalyzerInputProps) {
    const [queryDraft, setQueryDraft] = useState(initialQuery);
    const [queryDirty, setQueryDirty] = useState(false);
    const [inputMode, setInputMode] = useState<InputMode>("text");
    const [priceDraft, setPriceDraft] = useState<string>(initialPrice ? String(initialPrice) : "");
    const [priceDirty, setPriceDirty] = useState(false);
    const [wearsPerWeek, setWearsPerWeek] = useState<string>("2");
    const inputRef = useRef<HTMLInputElement>(null);
    const hasAutoTriggered = useRef(false);
    const query = queryDirty ? queryDraft : initialQuery;
    const price = priceDirty ? priceDraft : (initialPrice ? String(initialPrice) : "");
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
        const w = wearsPerWeek ? parseInt(wearsPerWeek, 10) : undefined;
        onAnalyze(query.trim(), inputMode, p && p > 0 ? p : undefined, w && w > 0 ? w : undefined);
    };
    const placeholders: Record<InputMode, string> = {
        text: "barrel leg jeans, mesh ballet flats, butter yellow...",
        url: "https://www.zara.com/us/en/product-page.html",
        image: "",
    };
    const modes = [
        { id: "text", label: "Text", icon: MagnifyingGlass },
        { id: "url", label: "URL", icon: LinkSimple },
        { id: "image", label: "Image", icon: ImageSquare },
    ];
    return (
        <div className="w-full relative">
            {/* Input Mode Tabs */}
            <div className="flex gap-3 w-fit mb-4 ml-1">
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        type="button"
                        onClick={() => setInputMode(mode.id as InputMode)}
                        className={`relative flex items-center justify-center min-w-[100px] px-6 py-2 rounded-full font-serif text-lg font-medium transition-colors duration-300 z-10 border-[3px] ${
                            inputMode === mode.id
                                ? "bg-forest text-white border-forest"
                                : "bg-transparent text-forest border-forest hover:bg-forest/10"
                        }`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
            {/* Input Form with Liquid Glass Refraction */}
            {inputMode === "image" ? (
                <ImageUploadDropzone
                    onImageAnalyzed={(suggestedQuery, brand) => {
                        setQueryDirty(true);
                        setQueryDraft(suggestedQuery);
                        if (onImageAnalyzed) {
                            onImageAnalyzed(suggestedQuery, brand);
                        } else {
                            onAnalyze(suggestedQuery, "image", undefined, undefined, brand);
                        }
                    }}
                    isLoading={isLoading}
                />
            ) : (
                <form onSubmit={handleSubmit} className="relative w-full group">
                    <div className="relative overflow-hidden bg-[#9fa686] border-2 border-forest rounded-full transition-all duration-500">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type={inputMode === "url" ? "url" : "text"}
                                value={query}
                                onChange={(e) => {
                                    setQueryDirty(true);
                                    setQueryDraft(e.target.value);
                                }}
                                placeholder={placeholders[inputMode]}
                                disabled={isLoading}
                                className="flex-1 py-4 pl-8 pr-4 bg-transparent border-none font-serif text-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-0 disabled:opacity-50"
                            />
                            <MagneticButton
                                isLoading={isLoading}
                                disabled={isLoading || !query.trim()}
                                onClick={handleSubmit}
                            />
                        </div>
                    </div>
                </form>
            )}
            {/* Price & Wears/Week Inputs - Clean & Unboxed */}
            <AnimatePresence>
                {inputMode !== "image" && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-wrap items-center gap-6 mt-6 ml-4"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-widest ml-1">Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 font-bold">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => {
                                        setPriceDirty(true);
                                        setPriceDraft(e.target.value);
                                    }}
                                    placeholder="0.00"
                                    disabled={isLoading}
                                    className="w-32 py-2.5 pl-7 pr-3 bg-forest-light/10 border-b-2 border-forest/10 focus:border-forest rounded-t-xl font-mono text-sm text-charcoal placeholder:text-charcoal/20 focus:outline-none transition-all duration-300"
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-widest ml-1">Wears / Week</label>
                            <input
                                type="number"
                                min="1"
                                max="7"
                                value={wearsPerWeek}
                                onChange={(e) => setWearsPerWeek(e.target.value)}
                                placeholder="2"
                                disabled={isLoading}
                                className="w-24 py-2.5 px-4 bg-forest-light/10 border-b-2 border-forest/10 focus:border-forest rounded-t-xl font-mono text-sm text-charcoal placeholder:text-charcoal/20 focus:outline-none transition-all duration-300"
                            />
                        </div>
                        
                        <div className="flex flex-col justify-end h-full self-end mb-1">
                             <p className="font-sans text-[10px] font-medium text-charcoal/40 max-w-[24ch]">
                                Helps us calculate the <span className="text-forest font-bold underline underline-offset-4">real</span> cost per wear.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="flex items-center gap-3 mt-8 px-6 py-4 bg-rust/5 border border-rust/10 rounded-2xl"
                    >
                        <Warning weight="fill" className="w-5 h-5 text-rust shrink-0" />
                        <span className="font-sans text-sm font-medium text-rust/90">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}