"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  _client = createClient(url, key);
  return _client;
}

// Returns null during SSR/build — callers must handle gracefully
function getClientOrNull(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  try { return getClient(); } catch { return null; }
}

export { getClient as getSupabase };

// Safe proxy: returns a no-op chain during SSR so builds never fail
const noopChain: any = new Proxy(
  {},
  {
    get(_t, _prop, _r) {
      // Return a function that returns another proxy (for chaining like .from().select().eq())
      return (..._args: any[]) => noopChain;
    },
  }
);

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClientOrNull();
    if (!client) return prop === "auth" ? noopChain : noopChain;
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
