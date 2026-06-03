import { StaffQueueClient } from "@/components/queue/staff-queue-client";

export default async function StaffEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <StaffQueueClient eventId={eventId} />;
}
