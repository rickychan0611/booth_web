import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, jsonError } from "@/lib/api";
import { getAdminUser, isAdminUser, isSameOriginMutation } from "@/lib/auth/admin";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export async function GET() {
  try {
    const user = await getAdminUser();
    return NextResponse.json({
      isAdmin: Boolean(user),
      email: user?.email ?? null,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return jsonError("Invalid request origin", 403);

    const credentials = loginSchema.parse(await request.json());
    const supabase = await createAuthServerClient();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error || !data.user) return jsonError("Invalid email or password", 401);
    if (!isAdminUser(data.user)) {
      await supabase.auth.signOut();
      return jsonError("This account is not an administrator", 403);
    }

    return NextResponse.json({
      isAdmin: true,
      email: data.user.email ?? null,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return jsonError("Invalid request origin", 403);
    const supabase = await createAuthServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ isAdmin: false });
  } catch (error) {
    return handleRouteError(error);
  }
}
