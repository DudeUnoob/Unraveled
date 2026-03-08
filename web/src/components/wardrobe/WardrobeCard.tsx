"use client";

import { motion } from "framer-motion";
import { Trash, TShirt } from "@phosphor-icons/react";
import { WearLogButton } from "./WearLogButton";
import type { WardrobeItem } from "@/types/user";

interface Props {
  item: WardrobeItem;
  onLogWear: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function WardrobeCard({ item, onLogWear, onDelete }: Props) {
  const wears = item.wear_count ?? 0;
  const cpw = item.price && wears > 0 ? item.price / wears : item.price ?? 0;

  const cpwLabel =
    wears === 0
      ? item.price
        ? `$${item.price.toFixed(2)}`
        : "—"
      : `$${cpw.toFixed(2)}`;

  const cpwColor =
    cpw <= 2 ? "text-emerald-600" : cpw <= 5 ? "text-amber-600" : "text-red-600";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-2xl border border-stone-200 bg-white overflow-hidden transition-shadow hover:shadow-md"
    >
      {/* Image / placeholder */}
      <div className="aspect-[4/3] bg-stone-50 flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <TShirt weight="light" className="w-12 h-12 text-stone-300" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-charcoal text-sm truncate">
              {item.product_name}
            </h3>
            {item.brand && (
              <p className="text-xs text-stone-400 mt-0.5">{item.brand}</p>
            )}
          </div>
          <button
            onClick={() => onDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-50 transition-all"
            title="Remove item"
          >
            <Trash weight="bold" className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-3 text-xs">
          <div>
            <span className="text-stone-400 block">Wears</span>
            <span className="font-semibold text-charcoal">{wears}</span>
          </div>
          <div className="w-px h-6 bg-stone-200" />
          <div>
            <span className="text-stone-400 block">CPW</span>
            <span className={`font-semibold ${wears > 0 ? cpwColor : "text-stone-400"}`}>
              {cpwLabel}
            </span>
          </div>
          {item.price && (
            <>
              <div className="w-px h-6 bg-stone-200" />
              <div>
                <span className="text-stone-400 block">Price</span>
                <span className="font-semibold text-charcoal">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Sustainability badge */}
        {item.sustainability_score != null && (
          <div className="mt-2">
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.sustainability_score >= 75
                  ? "bg-emerald-100 text-emerald-800"
                  : item.sustainability_score >= 50
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              Sust. {item.sustainability_score}/100
            </span>
          </div>
        )}

        {/* Wear button */}
        <div className="mt-3">
          <WearLogButton onLog={() => onLogWear(item.id)} />
        </div>
      </div>
    </motion.div>
  );
}
