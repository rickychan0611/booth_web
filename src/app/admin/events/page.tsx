import type { Metadata } from "next";
import { AdminEventsClient } from "@/components/queue/admin-events-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminEventsPage() {
  return <AdminEventsClient />;
}
