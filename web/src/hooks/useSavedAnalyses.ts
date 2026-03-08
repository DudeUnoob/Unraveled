"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { SavedAnalysis } from "@/types/user";

export function useSavedAnalyses() {
  const [saved, setSaved] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowser();

  const fetchSaved = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaved([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("user_saved_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });

    setSaved(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const save = useCallback(
    async (analysisId: string, queryText: string, trendLabel?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const row = {
        user_id: user.id,
        analysis_id: analysisId,
        query_text: queryText,
        trend_label: trendLabel ?? null,
      };

      const { error } = await supabase
        .from("user_saved_analyses")
        .upsert(row, { onConflict: "user_id,analysis_id" });

      if (!error) {
        setSaved((prev) => [
          { ...row, id: crypto.randomUUID(), notes: null, saved_at: new Date().toISOString() },
          ...prev.filter((s) => s.analysis_id !== analysisId),
        ]);
      }
      return !error;
    },
    [supabase],
  );

  const unsave = useCallback(
    async (analysisId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("user_saved_analyses")
        .delete()
        .eq("user_id", user.id)
        .eq("analysis_id", analysisId);

      if (!error) {
        setSaved((prev) => prev.filter((s) => s.analysis_id !== analysisId));
      }
      return !error;
    },
    [supabase],
  );

  const isSaved = useCallback(
    (analysisId: string) => saved.some((s) => s.analysis_id === analysisId),
    [saved],
  );

  return { saved, loading, save, unsave, isSaved, refetch: fetchSaved };
}
