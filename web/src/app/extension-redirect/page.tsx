import { redirect } from "next/navigation";

// W-1.9: Extension Deep Link Handler
// Accepts extension query params and redirects to /analyze with the same params
export default async function ExtensionRedirectPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;

    // Build URL search params from extension data
    const target = new URLSearchParams();
    target.set("source", "extension");

    const passthrough = [
        "pid", "name", "product_name", "product_url", "url",
        "brand", "price", "currency",
        "sustainability_score", "sustainability_grade",
        "trend_label", "trend_lifespan_weeks",
        "cpw", "cpw_adjusted",
        "health_label",
        "fiber_composition", "brand_rating_sources", "fiber_durability_wears",
    ];

    for (const key of passthrough) {
        const value = params[key];
        if (typeof value === "string" && value) {
            // Normalize "name" to "product_name"
            const normalizedKey = key === "name" ? "product_name" : key;
            target.set(normalizedKey, value);
        }
    }

    redirect(`/analyze?${target.toString()}`);
}
