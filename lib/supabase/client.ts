import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

let clientInstance: SupabaseClient | null = null;

// ---------------------------------------------------------------------------
// Password-reset link handling
// ---------------------------------------------------------------------------
// Reset emails land on the app with `#access_token=...&type=recovery` in the
// URL. Two things can go wrong with that:
//   1. supabase-js auto-detects the tokens and strips them from the URL as
//      soon as the client is created, so page code can no longer read them.
//   2. If the reset email's redirect target is not whitelisted in the
//      Supabase dashboard, the email opens on the configured Site URL (the
//      homepage) instead of /auth/reset-password.
// So we capture the tokens synchronously BEFORE the client is created and,
// when needed, forward the page to the reset screen with the tokens intact.
// ---------------------------------------------------------------------------

type RecoveryTokens = { accessToken: string; refreshToken: string };

let capturedRecovery: RecoveryTokens | null = null;

function captureRecoveryFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  if (!hash) return false;
  const params = new URLSearchParams(hash.substring(1));
  if (params.get("type") !== "recovery") return false;
  const accessToken = params.get("access_token");
  if (!accessToken) return false;
  capturedRecovery = {
    accessToken,
    refreshToken: params.get("refresh_token") || "",
  };
  return true;
}

/** Full-page redirect to the reset screen, keeping the recovery tokens in the URL. */
function forwardRecoveryToResetPage(): void {
  if (typeof window === "undefined") return;
  if (!captureRecoveryFromUrl()) return;
  if (window.location.pathname === "/auth/reset-password") return; // already there
  window.location.replace("/auth/reset-password" + window.location.hash);
}

/**
 * Recovery tokens captured from the current page load, if this load arrived
 * via a password-reset email link.
 */
export function getCapturedRecovery(): RecoveryTokens | null {
  return capturedRecovery;
}

function getClient(): SupabaseClient {
  // Runs before createClient() so the tokens are ours before the SDK's URL
  // auto-detection (`detectSessionInUrl`) consumes and strips them.
  forwardRecoveryToResetPage();
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

// Both exports point to the SAME client instance — no more split sessions
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getClient();
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

export function getSupabase(): SupabaseClient {
  return getClient();
}
