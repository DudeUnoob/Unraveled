"use client";

import { useState, useCallback } from "react";
import { SUPABASE_FUNCTIONS_URL } from "@/lib/supabase";
import type { AlternativeProduct, AlternativesResponse } from "@/types/alternatives";

type AlternativesState = "idle" | "loading" | "success" | "error";

export function useAlternatives() {
  const [state, setState] = useState<AlternativesState>("idle");
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAlternatives = useCallback(
    async (query: string, trendLabel: string, category?: string, maxPrice?: number) => {
      setState("loading");
      setError(null);

      try {
        const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/alternatives`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            trend_label: trendLabel,
            category,
            max_price: maxPrice,
            limit: 5,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({ detail: "Failed to fetch alternatives" }));
          throw new Error(errBody.detail || `Request failed (${res.status})`);
        }

        const data: AlternativesResponse = await res.json();
        setAlternatives(data.alternatives);
        setState("success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        setState("error");
      }
    },
    []
  );

  return { state, alternatives, error, fetchAlternatives };
}
