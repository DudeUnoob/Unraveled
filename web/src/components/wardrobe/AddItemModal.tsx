"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    product_name: string;
    brand?: string;
    category?: string;
    price?: number;
    currency?: string;
    notes?: string;
    purchased_at?: string;
  }) => Promise<unknown>;
}

const categories = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Activewear",
  "Other",
];

export function AddItemModal({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setBrand("");
    setCategory("");
    setPrice("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    await onAdd({
      product_name: name.trim(),
      brand: brand.trim() || undefined,
      category: category || undefined,
      price: price ? parseFloat(price) : undefined,
      notes: notes.trim() || undefined,
      purchased_at: date || undefined,
    });
    setSubmitting(false);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-xl z-[201] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="text-lg font-semibold text-charcoal">
                Add to Wardrobe
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X weight="bold" className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">
                  Product name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Linen Blend Shirt"
                  required
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-charcoal placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-charcoal/20 transition"
                />
              </div>

              {/* Brand + Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Zara"
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-charcoal placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-charcoal/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/20 transition appearance-none bg-white"
                  >
                    <option value="">Select...</option>
                    {categories.map((c) => (
                      <option key={c} value={c.toLowerCase()}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price + Date row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="49.90"
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-charcoal placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-charcoal/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">
                    Purchase date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/20 transition"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any details about the item..."
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-charcoal placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-charcoal/20 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="w-full rounded-full bg-charcoal text-cream py-3 text-sm font-semibold transition-colors hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add Item"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
