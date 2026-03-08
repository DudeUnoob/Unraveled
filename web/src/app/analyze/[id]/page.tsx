import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import type { TrendAnalysisResponse, TrendLifespan, TrendCurve, DecayParams } from "@/types/analysis";
import { SharedAnalysisView } from "./SharedAnalysisView";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://fmndxwcgyzevetcoizwd.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const WEB_APP_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://unraveled-kappa.vercel.app";

function getServerSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function getAnalysis(id: string) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("trend_analyses")
    .select("*")
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const analysis = await getAnalysis(id);

  if (!analysis) {
    return { title: "Analysis Not Found | Unravel" };
  }

  const lifespan = analysis.trend_lifespan as TrendLifespan;
  const query = analysis.query_text as string;

  let description = "Trend analysis by Unravel.";
  if (lifespan.label === "Timeless") {
    description = `${query} shows stable, enduring interest. A timeless style worth investing in.`;
  } else if (lifespan.label === "Trending") {
    description = `${query} is currently trending with ~${lifespan.weeks_remaining} weeks of strong relevance projected.`;
  } else if (lifespan.label === "Fading") {
    description = `${query} peaked and is declining. ~${lifespan.weeks_remaining} weeks of relevance remain.`;
  } else if (lifespan.label === "Dead") {
    description = `${query} interest has collapsed. This trend is effectively dead.`;
  }

  return {
    title: `${query} — ${lifespan.label} | Unravel`,
    description,
    openGraph: {
      title: `${query} — ${lifespan.label} | Unravel`,
      description,
      type: "article",
      url: `${WEB_APP_BASE_URL}/analyze/${id}`,
    },
  };
}

export default async function SharedAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = await getAnalysis(id);

  if (!analysis) {
    notFound();
  }

  const lifespan = analysis.trend_lifespan as TrendLifespan;
  const curveRaw = analysis.trend_curve;

  // trend_curve is stored as CurveDataPoint[] array directly
  const dataPoints = Array.isArray(curveRaw) ? curveRaw : (curveRaw as TrendCurve)?.data_points ?? [];
  const decayParams = analysis.decay_params as DecayParams;

  // Reconstruct peak_week and death_week from data
  const historicalPoints = dataPoints.filter((p: { projected?: boolean }) => !p.projected);
  const peakPoint = historicalPoints.reduce(
    (max: { interest: number; week: string }, p: { interest: number; week: string }) =>
      p.interest > max.interest ? p : max,
    historicalPoints[0] ?? { interest: 0, week: "" }
  );
  const deathPoint = dataPoints.find(
    (p: { projected?: boolean; interest: number }) =>
      p.projected && p.interest < (decayParams.K * 0.15)
  );

  const trendCurve: TrendCurve = {
    data_points: dataPoints,
    peak_week: peakPoint?.week ?? "",
    death_week: deathPoint?.week ?? dataPoints[dataPoints.length - 1]?.week ?? "",
    model_type: "logistic_decay",
    r_squared: decayParams.r_squared,
  };

  const responseData: TrendAnalysisResponse = {
    analysis_id: analysis.id,
    query_normalized: analysis.query_text,
    trend_lifespan: lifespan,
    trend_curve: trendCurve,
    decay_params: decayParams,
    data_sources: {
      google_trends: {
        available: true,
        last_updated: analysis.created_at,
        from_cache: true,
      },
    },
    shareable_url: `${WEB_APP_BASE_URL}/analyze/${analysis.id}`,
  };

  return <SharedAnalysisView data={responseData} />;
}
