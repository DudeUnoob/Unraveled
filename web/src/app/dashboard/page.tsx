import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase-server";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | Unravel",
  description: "Your saved analyses, wardrobe tracker, and sustainability journey.",
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?login=true");
  }

  return <DashboardContent user={user} />;
}
