"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check } from "@phosphor-icons/react";

interface Props {
  onLog: () => Promise<boolean>;
}

export function WearLogButton({ onLog }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async () => {
    if (state !== "idle") return;
    setState("loading");
    const ok = await onLog();
    setState(ok ? "success" : "idle");
    if (ok) {
      setTimeout(() => setState("idle"), 1200);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={handleClick}
      disabled={state === "loading"}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        state === "success"
          ? "bg-emerald-100 text-emerald-800"
          : "bg-stone-100 text-charcoal hover:bg-stone-200"
      }`}
    >
      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.span
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check weight="bold" className="w-3.5 h-3.5" />
          </motion.span>
        ) : (
          <motion.span
            key="plus"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
      {state === "success" ? "Logged" : "Log Wear"}
    </motion.button>
  );
}
