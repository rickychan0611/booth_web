import { EventGalleryClient } from "@/components/gallery/event-gallery-client";

type EventGalleryPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EventGalleryPage({ params }: EventGalleryPageProps) {
  const { eventId } = await params;

  return <EventGalleryClient eventId={eventId} />;
}
