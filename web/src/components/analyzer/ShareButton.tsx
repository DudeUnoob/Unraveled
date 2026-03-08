"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareNetwork, Check } from "@phosphor-icons/react";

interface ShareButtonProps {
  shareableUrl: string | null;
}

export function ShareButton({ shareableUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (!shareableUrl) return;

    // Try native share first (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Unravel Trend Analysis", url: shareableUrl });
        return;
      } catch {
        // User cancelled or not supported, fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = shareableUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareableUrl]);

  if (!shareableUrl) return null;

  return (
    <motion.button
      onClick={handleShare}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-charcoal/10 rounded-full font-sans text-xs font-medium text-charcoal/60 hover:text-charcoal hover:border-charcoal/20 transition-all duration-200"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 text-forest"
          >
            <Check weight="bold" className="w-3.5 h-3.5" />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="share"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <ShareNetwork weight="bold" className="w-3.5 h-3.5" />
            Share
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
