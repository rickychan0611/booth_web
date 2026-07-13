import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { businessInfo } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vibo Photo Booth | Luxury Gold Photo Booth Rental Vancouver",
    template: "%s | Vibo Photo Booth",
  },
  description:
    "Vibo Photo Booth offers luxury gold photo booth rentals for weddings, corporate events, and parties in Vancouver, Richmond, Burnaby, Surrey, and the Lower Mainland.",
  applicationName: businessInfo.name,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: businessInfo.name,
    locale: "en_CA",
    url: siteUrl,
    title: "Vibo Photo Booth | Luxury Gold Photo Booth Rental Vancouver",
    description:
      "Luxury gold photo booth rentals for weddings, corporate events, and parties across Vancouver and the Lower Mainland.",
    images: [
      {
        url: businessInfo.ogImagePath,
        width: 1200,
        height: 630,
        alt: "Vibo Photo Booth luxury gold photo booth setup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibo Photo Booth | Luxury Gold Photo Booth Rental Vancouver",
    description:
      "Luxury gold photo booth rentals for weddings, corporate events, and parties across Vancouver and the Lower Mainland.",
    images: [businessInfo.ogImagePath],
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
