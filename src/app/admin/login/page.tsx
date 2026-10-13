import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata: Metadata = {
  title: "Admin sign in | Vibo Photo Booth",
  robots: { index: false, follow: false },
};

function safeReturnTo(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.startsWith("/") && !candidate.startsWith("//")
    ? candidate
    : "/admin/events";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 py-12 text-neutral-950">
      <div className="w-full max-w-sm">
        <header className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Vibo Photo Booth</p>
          <h1 className="mt-2 text-3xl font-bold">Admin sign in</h1>
          <p className="mt-2 text-sm text-neutral-600">Sign in to manage and delete gallery files.</p>
        </header>
        <AdminLoginForm returnTo={safeReturnTo(params.returnTo)} />
      </div>
    </main>
  );
}
