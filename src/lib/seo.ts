import { getSiteUrl } from "@/lib/site-url";

export const businessInfo = {
  name: "Vibo Photo Booth",
  legalName: "Vibo Photo Booth",
  email: "vibobooth@gmail.com",
  logoPath: "/vibo-logo.png",
  ogImagePath: "/booth-hero2.png",
  priceRange: "$$",
  areaServed: ["Vancouver", "Richmond", "Burnaby", "Surrey", "Lower Mainland"],
  region: "British Columbia",
  country: "CA",
  sameAs: [] as string[],
} as const;

export const defaultKeywords = [
  "photo booth rental Vancouver",
  "photo booth Vancouver",
  "wedding photo booth Vancouver",
  "photo booth rental Richmond",
  "photo booth Lower Mainland",
  "corporate photo booth Vancouver",
  "party photo booth rental",
  "gold photo booth rental Vancouver",
  "unlimited prints photo booth",
  "custom photo booth templates",
  "43 inch touch screen photo booth",
] as const;

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${absoluteUrl("/")}#business`,
    name: businessInfo.name,
    legalName: businessInfo.legalName,
    url: absoluteUrl("/"),
    email: businessInfo.email,
    image: absoluteUrl(businessInfo.ogImagePath),
    logo: absoluteUrl(businessInfo.logoPath),
    priceRange: businessInfo.priceRange,
    description:
      "Luxury gold photo booth rental for weddings, corporate events, birthdays, and private parties in Vancouver, Richmond, Burnaby, Surrey, and the Lower Mainland. Includes a 43 inch touch screen booth, unlimited prints, custom templates, props, backdrop, and an online gallery.",
    address: {
      "@type": "PostalAddress",
      addressRegion: businessInfo.region,
      addressCountry: businessInfo.country,
    },
    areaServed: businessInfo.areaServed.map((name) => ({
      "@type": "City",
      name,
    })),
    makesOffer: [
      "Wedding photo booth rental",
      "Corporate photo booth rental",
      "Birthday photo booth rental",
      "Party photo booth rental",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
    ...(businessInfo.sameAs.length ? { sameAs: businessInfo.sameAs } : {}),
  };
}

export function faqJsonLd(faqs: ReadonlyArray<readonly [string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}
