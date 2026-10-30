import { getSupabase } from "@/lib/supabase/client";

export type CommunityMember = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  is_teacher: boolean;
  joined_at: string;
};

export type CommunityPost = {
  id: string;
  room_slug: string | null;
  author_id: string;
  title: string;
  body: string;
  faculty_slug: string | null;
  subject_slug: string | null;
  question_id: string | null;
  status: "active" | "deleted" | "hidden";
  is_locked: boolean;
  accepted_reply_id: string | null;
  helpful_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
};

export type CommunityReply = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  status: "active" | "deleted" | "hidden";
  helpful_count: number;
  created_at: string;
  updated_at: string;
};

export async function loadCommunityMembers(ids: string[]): Promise<Record<string, CommunityMember>> {
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return {};
  const { data, error } = await getSupabase().from("community_members").select("*").in("user_id", unique);
  if (error) throw error;
  return Object.fromEntries((data as CommunityMember[]).map((member) => [member.user_id, member]));
}

export function communityError(error: unknown): string {
  const value = error as { code?: string; message?: string };
  if (value?.code === "42P01" || value?.code === "PGRST205" || value?.code === "PGRST202" || value?.code === "42703")
    return "Community is being prepared. Please try again after the database update.";
  if (value?.code === "23505") return "You've already done this. Refresh to see the latest state.";
  if (value?.code === "42501") return "You don't have permission for that action.";
  if (value?.message?.includes("Posting limit") || value?.message?.includes("Reply limit")
    || value?.message?.includes("already posted")) return value.message;
  return "Something went wrong. Check your connection and try again.";
}
