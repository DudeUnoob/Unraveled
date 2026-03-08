import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { BrandProfile } from "@/types/user";
import { BrandProfileContent } from "./BrandProfileContent";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBrand(slug: string): Promise<BrandProfile | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  return data as BrandProfile | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Brand Not Found | Unravel" };

  return {
    title: `${brand.name} Sustainability Profile | Unravel`,
    description:
      brand.sustainability_summary ??
      `See ${brand.name}'s sustainability ratings, certifications, and environmental impact data.`,
  };
}

export const revalidate = 3600;

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  return <BrandProfileContent brand={brand} />;
}
