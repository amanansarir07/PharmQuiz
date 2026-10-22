import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return Response.json({ error: "Sign in to delete your account." }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return Response.json({ error: "Account deletion is not configured yet. Please contact support." }, { status: 503 });
  }

  let body: { password?: unknown; confirmation?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid confirmation." }, { status: 400 });
  }
  if (body.confirmation !== "DELETE") {
    return Response.json({ error: "Type DELETE to confirm." }, { status: 400 });
  }

  const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
  const verifier = createClient(url, anonKey, options);
  const { data: { user }, error: authError } = await verifier.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: "Your session has expired. Sign in again." }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return Response.json({ error: "Account deletion is not configured yet. Please contact support." }, { status: 503 });
  }

  const hasPassword = user.identities?.some((identity) => identity.provider === "email")
    || user.app_metadata?.provider === "email"
    || user.app_metadata?.providers?.includes("email")
    || (!user.identities?.length && !user.app_metadata?.provider);
  if (hasPassword) {
    if (typeof body.password !== "string" || !body.password) {
      return Response.json({ error: "Enter your password to confirm." }, { status: 400 });
    }
    // Use an isolated client so password verification cannot replace the
    // caller's session. The verified identity must match the bearer token.
    const passwordVerifier = createClient(url, anonKey, options);
    const { data, error } = await passwordVerifier.auth.signInWithPassword({
      email: user.email ?? "",
      password: body.password,
    });
    if (error || data.user?.id !== user.id) {
      return Response.json({ error: "Incorrect password." }, { status: 403 });
    }
  }

  // Only this server route receives the service-role key. The user ID comes
  // exclusively from Supabase's verified bearer token, never from the body.
  const admin = createClient(url, serviceKey, options);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Account deletion failed:", error.message);
    return Response.json({ error: "We could not delete your account. Please try again." }, { status: 500 });
  }
  return Response.json({ deleted: true });
}
