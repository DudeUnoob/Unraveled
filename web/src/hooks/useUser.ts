"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowser();

  const fetchUser = useCallback(async () => {
    const { data: { user: current } } = await supabase.auth.getUser();
    setUser(current);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    setTimeout(() => { fetchUser(); }, 0);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchUser]);

  const signInWithGoogle = async (redirectTo?: string) => {
    const callbackUrl = `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signInWithGoogle, signOut };
}
