import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { GalleryContent } from "./GalleryContent";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://fmndxwcgyzevetcoizwd.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const metadata: Metadata = {
  title: "Trend Graveyard | Unravel",
  description:
    "Browse past trend predictions. See what died, what's fading, and what's truly timeless.",
};

export const revalidate = 300; // ISR: revalidate every 5 minutes

interface AnalysisRow {
  id: string;
  query_text: string;
  trend_lifespan: {
    label: string;
    weeks_remaining: number;
    confidence: number;
  };
  created_at: string;
}

async function getRecentAnalyses(): Promise<AnalysisRow[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from("trend_analyses")
    .select("id, query_text, trend_lifespan, created_at")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as AnalysisRow[];
}

export default async function GalleryPage() {
  const analyses = await getRecentAnalyses();

  // Deduplicate by query_text (keep most recent)
  const seen = new Set<string>();
  const unique = analyses.filter((a) => {
    const key = a.query_text.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return <GalleryContent analyses={unique} />;
}
