import type { Metadata } from "next";
import { BoothClient } from "@/components/queue/booth-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BoothEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <BoothClient eventId={eventId} />;
}
