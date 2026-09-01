"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("Supabase client can only be used in the browser");
  }
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }
  _client = createClient(url, key);
  return _client;
}

// Named export for new code
export { getClient as getSupabase };

// Lazy proxy export so `import { supabase } from "@/lib/supabase/client"` still works
// Properties are only accessed at runtime in browser, never during build
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
