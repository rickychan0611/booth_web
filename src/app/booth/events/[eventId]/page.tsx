import { BoothClient } from "@/components/queue/booth-client";

export default async function BoothEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <BoothClient eventId={eventId} />;
}
