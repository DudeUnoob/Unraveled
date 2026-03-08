import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { BrandProfile } from "@/types/user";
import { BrandsGrid } from "./BrandsGrid";

export const metadata: Metadata = {
  title: "Brand Sustainability Profiles | Unravel",
  description:
    "Explore the sustainability ratings of popular fashion brands. Data-backed profiles from Good On You, B Corp, and more.",
};

export const revalidate = 3600;

async function getBrands(): Promise<BrandProfile[]> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("brand_profiles")
    .select("*")
    .order("brand_score", { ascending: false });

  return (data ?? []) as BrandProfile[];
}

export default async function BrandsPage() {
  const brands = await getBrands();
  return <BrandsGrid brands={brands} />;
}
