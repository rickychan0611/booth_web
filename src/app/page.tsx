import type { Metadata } from "next";
import { ViboLandingPage } from "@/components/landing/vibo-landing-page";
import { faqs } from "@/components/landing/vibo-faqs";
import { defaultKeywords, faqJsonLd, localBusinessJsonLd } from "@/lib/seo";

const description =
  "Book Vibo Photo Booth for weddings, birthdays, corporate events, school events, and private parties in Vancouver, Richmond, Burnaby, Surrey, and the Lower Mainland. Featuring a luxury gold framed 43 inch touch screen booth, unlimited prints, custom templates, props, backdrop, online gallery, and attendant options.";

export const metadata: Metadata = {
  title: {
    absolute: "Vibo Photo Booth | Luxury Gold Photo Booth Rental Vancouver",
  },
  description,
  keywords: [...defaultKeywords],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vibo Photo Booth | Luxury Gold Photo Booth Rental Vancouver",
    description,
    url: "/",
  },
  twitter: {
    title: "Vibo Photo Booth | Luxury Gold Photo Booth Rental Vancouver",
    description,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
      <ViboLandingPage />
    </>
  );
}
