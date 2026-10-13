import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { AdminEventsClient } from "@/components/queue/admin-events-client";
import { getAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminEventsPage() {
  const user = await getAdminUser();

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 py-12 text-neutral-950">
        <div className="w-full max-w-sm">
          <header className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Vibo Photo Booth</p>
            <h1 className="mt-2 text-3xl font-bold">Admin sign in</h1>
            <p className="mt-2 text-sm text-neutral-600">Sign in to manage events and gallery files.</p>
          </header>
          <AdminLoginForm returnTo="/admin/events" />
        </div>
      </main>
    );
  }

  return <AdminEventsClient />;
}
