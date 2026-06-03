import { GalleryClient } from "@/components/gallery/gallery-client";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ galleryToken: string }>;
}) {
  const { galleryToken } = await params;

  return <GalleryClient galleryToken={galleryToken} />;
}
