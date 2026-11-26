import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminEventsClient } from "@/components/queue/admin-events-client";
import { getAdminUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminEventsPage() {
  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login?returnTo=%2Fadmin%2Fevents");
  }

  return <AdminEventsClient />;
}
