"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TShirt, CurrencyDollar } from "@phosphor-icons/react";
import { WardrobeCard } from "./WardrobeCard";
import { AddItemModal } from "./AddItemModal";
import { useWardrobe } from "@/hooks/useWardrobe";

export function WardrobeTab() {
  const { items, loading, addItem, deleteItem, logWear } = useWardrobe();
  const [modalOpen, setModalOpen] = useState(false);

  const totalItems = items.length;
  const totalInvestment = items.reduce((s, i) => s + (i.price ?? 0), 0);
  const totalWears = items.reduce((s, i) => s + (i.wear_count ?? 0), 0);
  const avgCpw =
    totalWears > 0 ? totalInvestment / totalWears : totalInvestment;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-2xl bg-stone-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-6 mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-100">
        <div className="flex items-center gap-2">
          <TShirt weight="bold" className="w-4 h-4 text-stone-500" />
          <span className="text-sm text-stone-500">Items</span>
          <span className="text-sm font-bold text-charcoal">{totalItems}</span>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyDollar weight="bold" className="w-4 h-4 text-stone-500" />
          <span className="text-sm text-stone-500">Invested</span>
          <span className="text-sm font-bold text-charcoal">
            ${totalInvestment.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Total wears</span>
          <span className="text-sm font-bold text-charcoal">{totalWears}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Avg CPW</span>
          <span
            className={`text-sm font-bold ${
              avgCpw <= 2
                ? "text-emerald-600"
                : avgCpw <= 5
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {totalWears > 0 ? `$${avgCpw.toFixed(2)}` : "—"}
          </span>
        </div>

        <div className="ml-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-charcoal text-cream px-4 py-2 text-xs font-semibold transition-colors hover:bg-charcoal/90"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            Add Item
          </motion.button>
        </div>
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
            <TShirt weight="light" className="w-7 h-7 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal">
            Your wardrobe is empty
          </h3>
          <p className="mt-1 text-sm text-stone-500 max-w-sm">
            Add items you own to track their cost per wear over time.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalOpen(true)}
            className="mt-5 flex items-center gap-1.5 rounded-full bg-charcoal text-cream px-5 py-2.5 text-sm font-medium"
          >
            <Plus weight="bold" className="w-4 h-4" />
            Add Your First Item
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <WardrobeCard
                key={item.id}
                item={item}
                onLogWear={logWear}
                onDelete={deleteItem}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addItem}
      />
    </>
  );
}
