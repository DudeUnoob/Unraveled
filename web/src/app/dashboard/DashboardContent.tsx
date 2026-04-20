"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, TShirt } from "@phosphor-icons/react";
import type { User } from "@supabase/supabase-js";
import { Footer } from "@/components/layout/Footer";
import { SavedAnalysesTab } from "@/components/saved/SavedAnalysesTab";
import { WardrobeTab } from "@/components/wardrobe/WardrobeTab";

type Tab = "saved" | "wardrobe";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "saved",
    label: "Saved Analyses",
    icon: <Bookmark weight="bold" className="w-4 h-4" />,
  },
  {
    key: "wardrobe",
    label: "Wardrobe",
    icon: <TShirt weight="bold" className="w-4 h-4" />,
  },
];

export function DashboardContent({ user }: { user: User }) {
  const [active, setActive] = useState<Tab>("saved");

  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "there";

  return (
    <div className="min-h-screen bg-cream">
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal tracking-tight">
            Hey, {displayName}
          </h1>
          <p className="mt-1 text-stone-500 text-base">
            Your sustainability dashboard — saved analyses and wardrobe tracker.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mt-8 mb-8 flex items-center gap-1 bg-stone-100 rounded-full p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                active === tab.key
                  ? "text-charcoal"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {active === tab.key && (
                <motion.div
                  layoutId="dashboard-tab"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  transition={{ type: "spring", damping: 28, stiffness: 350 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {active === "saved" && <SavedAnalysesTab />}
        {active === "wardrobe" && <WardrobeTab />}
      </main>

      <Footer />
    </div>
  );
}

