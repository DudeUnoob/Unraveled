"use client";

import { useState, useCallback } from "react";
import { SUPABASE_FUNCTIONS_URL } from "@/lib/supabase";
import { normalizeQueryText } from "@/lib/normalizeQuery";
import type { AnalysisStore, TrendAnalysisResponse } from "@/types/analysis";

interface AnalyzeOptions {
    skipCache?: boolean;
    refreshSocial?: boolean;
}

const INITIAL_STATE: AnalysisStore & { price?: number; wearsPerWeek?: number } = {
    state: "idle",
    data: null,
    error: null,
    query: "",
    price: undefined,
    wearsPerWeek: undefined,
};

export function useAnalyze() {
    const [store, setStore] = useState<AnalysisStore & { price?: number; wearsPerWeek?: number }>(INITIAL_STATE);

    const analyze = useCallback(async (
        query: string,
        inputType = "text",
        price?: number,
        wearsPerWeek?: number,
        brand?: string | null,
        options?: AnalyzeOptions,
    ) => {
        if (!query.trim()) {
            setStore((prev) => ({
                ...prev,
                state: "error",
                error: "Enter a product name, trend, or style to analyze.",
            }));
            return;
        }

        const normalizedQuery = normalizeQueryText(query);

        setStore({ state: "loading", data: null, error: null, query: normalizedQuery, price, wearsPerWeek });

        try {
            const body: Record<string, unknown> = {
                query: normalizedQuery,
                input_type: inputType,
            };
            if (price && price > 0) {
                body.price = price;
            }
            if (brand && brand.trim()) {
                body.brand = brand.trim();
            }
            if (options?.skipCache === true) {
                body.skip_cache = true;
            }
            if (typeof options?.refreshSocial === "boolean") {
                body.refresh_social = options.refreshSocial;
            }

            const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/trend-analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({ detail: "Analysis failed" }));
                throw new Error(errBody.detail || `Request failed (${res.status})`);
            }

            const data: TrendAnalysisResponse = await res.json();

            setStore({ state: "success", data, error: null, query: normalizedQuery, price, wearsPerWeek });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setStore((prev) => ({ ...prev, state: "error", error: message }));
        }
    }, []);

    const reset = useCallback(() => {
        setStore(INITIAL_STATE);
    }, []);

    return { ...store, analyze, reset };
}
