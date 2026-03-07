"use client";

import { useState, useCallback, useEffect } from "react";
import { SUPABASE_FUNCTIONS_URL } from "@/lib/supabase";
import type { AnalysisStore, TrendAnalysisResponse } from "@/types/analysis";

const INITIAL_STATE: AnalysisStore = {
    state: "idle",
    data: null,
    error: null,
    query: "",
};

export function useAnalyze() {
    const [store, setStore] = useState<AnalysisStore>(INITIAL_STATE);

    const analyze = useCallback(async (query: string, inputType = "text") => {
        if (!query.trim()) {
            setStore((prev) => ({
                ...prev,
                state: "error",
                error: "Enter a product name, trend, or style to analyze.",
            }));
            return;
        }

        setStore({ state: "loading", data: null, error: null, query: query.trim() });

        try {
            const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/trend-analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: query.trim(), input_type: inputType }),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({ detail: "Analysis failed" }));
                throw new Error(errBody.detail || `Request failed (${res.status})`);
            }

            const data: TrendAnalysisResponse = await res.json();

            setStore({ state: "success", data, error: null, query: query.trim() });
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
