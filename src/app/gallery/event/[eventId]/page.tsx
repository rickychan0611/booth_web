import type { Metadata } from "next";
import { EventGalleryClient } from "@/components/gallery/event-gallery-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type EventGalleryPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EventGalleryPage({ params }: EventGalleryPageProps) {
  const { eventId } = await params;

  return <EventGalleryClient eventId={eventId} />;
}
