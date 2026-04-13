"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { ExtensionData } from "@/types/analysis";
import { Plugs, ArrowSquareOut } from "@phosphor-icons/react";

interface ExtensionDataBannerProps {
    extensionData: ExtensionData;
}

export const ExtensionDataBanner = memo(function ExtensionDataBanner({
    extensionData,
}: ExtensionDataBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-forest/5 border border-forest/10 mb-8"
        >
            <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
                <Plugs weight="bold" className="w-5 h-5 text-forest" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-sans text-xs font-bold text-forest uppercase tracking-widest">Chrome Extension Link</span>
                    <div className="w-1 h-1 rounded-full bg-forest/30" />
                    <span className="font-mono text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Active Session</span>
                </div>
                <p className="font-sans text-sm text-charcoal/70 truncate font-medium">
                    Analyzing <span className="text-charcoal font-bold">{extensionData.productName}</span>
                    {extensionData.brand && extensionData.brand !== "Unknown" && (
                        <span className="text-charcoal/40 italic"> by {extensionData.brand}</span>
                    )}
                </p>
            </div>
            {extensionData.productUrl && (
                <a
                    href={extensionData.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-forest/5 font-sans text-xs font-bold text-forest hover:bg-forest hover:text-cream transition-all duration-300"
                >
                    View Product
                    <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
                </a>
            )}
        </motion.div>
    );
});
