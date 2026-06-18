import type { Metadata } from "next";
import { GalleryClient } from "@/components/gallery/gallery-client";
import { getGalleryPublicMeta } from "@/lib/gallery/public-meta";
import { getSiteUrl } from "@/lib/site-url";

type GalleryPageProps = {
  params: Promise<{ galleryToken: string }>;
};

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { galleryToken } = await params;
  const meta = await getGalleryPublicMeta(galleryToken);

  if (!meta) {
    return {
      title: "Gallery not found | Vibo Photo Booth",
    };
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/gallery/${galleryToken}`;
  const ogImageUrl = `${siteUrl}/api/og/gallery/${galleryToken}`;
  const description = `View and share photos from ${meta.eventName} — Vibo Photo Booth`;

  return {
    title: `${meta.eventName} | Vibo Photo Booth`,
    description,
    openGraph: {
      title: `My photos from ${meta.eventName}`,
      description,
      url: pageUrl,
      siteName: "Vibo Photo Booth",
      type: "website",
      images: [
        {
          url: meta.previewAsset ? ogImageUrl : `${siteUrl}/vibo-logo.png`,
          width: 1200,
          height: 630,
          alt: `${meta.eventName} photo booth gallery`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `My photos from ${meta.eventName}`,
      description,
      images: [meta.previewAsset ? ogImageUrl : `${siteUrl}/vibo-logo.png`],
    },
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { galleryToken } = await params;
  const sharePageUrl = `${getSiteUrl()}/gallery/${galleryToken}`;

  return <GalleryClient galleryToken={galleryToken} sharePageUrl={sharePageUrl} />;
}
