import type { Metadata } from "next";
import { StaffQueueClient } from "@/components/queue/staff-queue-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StaffEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <StaffQueueClient eventId={eventId} />;
}
