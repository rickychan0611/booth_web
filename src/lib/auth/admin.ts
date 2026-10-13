import type { User } from "@supabase/supabase-js";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

function adminEmails() {
  return new Set(
    [process.env.ADMIN_EMAILS, process.env.BOOKING_NOTIFY_EMAIL]
      .filter(Boolean)
      .flatMap((value) => value!.split(","))
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminUser(user: User | null) {
  if (!user?.email) return false;
  return (
    user.app_metadata?.role === "admin" ||
    adminEmails().has(user.email.toLowerCase())
  );
}

export async function getAdminUser() {
  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !isAdminUser(data.user)) return null;
  return data.user;
}

export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}
