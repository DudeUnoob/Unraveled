"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { WardrobeItem } from "@/types/user";

interface AddItemPayload {
  product_name: string;
  brand?: string;
  category?: string;
  price?: number;
  currency?: string;
  fiber_content?: Record<string, number>;
  sustainability_score?: number;
  analysis_id?: string;
  image_url?: string;
  notes?: string;
  purchased_at?: string;
}

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowser();

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: wardrobeData } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!wardrobeData) {
      setItems([]);
      setLoading(false);
      return;
    }

    const itemIds = wardrobeData.map((i) => i.id);
    const { data: wearData } = await supabase
      .from("wear_logs")
      .select("item_id")
      .in("item_id", itemIds);

    const wearCounts: Record<string, number> = {};
    wearData?.forEach((w) => {
      wearCounts[w.item_id] = (wearCounts[w.item_id] ?? 0) + 1;
    });

    const enriched: WardrobeItem[] = wardrobeData.map((item) => ({
      ...item,
      wear_count: wearCounts[item.id] ?? 0,
    }));

    setItems(enriched);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    setTimeout(() => { fetchItems(); }, 0);
  }, [fetchItems]);

  const addItem = useCallback(
    async (payload: AddItemPayload) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("wardrobe_items")
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();

      if (!error && data) {
        setItems((prev) => [{ ...data, wear_count: 0 }, ...prev]);
      }
      return data;
    },
    [supabase],
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      const { error } = await supabase
        .from("wardrobe_items")
        .delete()
        .eq("id", itemId);

      if (!error) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      }
      return !error;
    },
    [supabase],
  );

  const logWear = useCallback(
    async (itemId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, wear_count: (i.wear_count ?? 0) + 1 } : i,
        ),
      );

      const { error } = await supabase
        .from("wear_logs")
        .insert({ item_id: itemId, user_id: user.id });

      if (error) {
        // Rollback
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? { ...i, wear_count: Math.max((i.wear_count ?? 1) - 1, 0) }
              : i,
          ),
        );
      }
      return !error;
    },
    [supabase],
  );

  return { items, loading, addItem, deleteItem, logWear, refetch: fetchItems };
}
