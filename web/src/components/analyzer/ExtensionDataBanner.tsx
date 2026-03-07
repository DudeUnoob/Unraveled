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
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#2C4A3E]/[0.05] border border-[#2C4A3E]/10 mb-8"
        >
            <div className="w-8 h-8 rounded-lg bg-[#2C4A3E]/10 flex items-center justify-center shrink-0">
                <Plugs weight="duotone" className="w-4 h-4 text-[#2C4A3E]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-charcoal/70 truncate">
                    <span className="font-semibold text-[#2C4A3E]">From Chrome Extension</span>
                    {extensionData.brand && extensionData.brand !== "Unknown" && (
                        <span className="text-charcoal/40"> · {extensionData.brand}</span>
                    )}
                    {extensionData.price != null && extensionData.price > 0 && (
                        <span className="text-charcoal/40">
                            {" · "}
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: extensionData.currency || "USD",
                            }).format(extensionData.price)}
                        </span>
                    )}
                </p>
            </div>
            {extensionData.productUrl && (
                <a
                    href={extensionData.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 font-mono text-[10px] text-[#2C4A3E] uppercase tracking-wider hover:underline"
                >
                    <ArrowSquareOut weight="bold" className="w-3 h-3" />
                    View product
                </a>
            )}
        </motion.div>
    );
});
