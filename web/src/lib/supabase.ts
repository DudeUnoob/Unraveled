import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://fmndxwcgyzevetcoizwd.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabase;
}

export const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Headers for direct fetch() to Edge Functions. Supabase may require the anon
 * key (Authorization + apikey) when JWT verification is enabled in production.
 */
export function getSupabaseFunctionsHeaders(): Record<string, string> {
    const key = (SUPABASE_ANON_KEY || "").trim();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (key) {
        headers.Authorization = `Bearer ${key}`;
        headers.apikey = key;
    }
    return headers;
}
