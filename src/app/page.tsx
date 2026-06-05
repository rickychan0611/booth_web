import type { Metadata } from "next";
import { ViboLandingPage } from "@/components/landing/vibo-landing-page";

export const metadata: Metadata = {
  title: "Vibo Photo Booth | Luxury Gold Photo Booth Rental Vancouver",
  description:
    "Book Vibo Photo Booth for weddings, birthdays, corporate events, school events, and private parties in Vancouver, Richmond, Burnaby, Surrey, and the Lower Mainland. Featuring a luxury gold framed 43 inch touch screen booth, unlimited prints, custom templates, props, backdrop, online gallery, and attendant options.",
  keywords: [
    "Vibo Photo Booth",
    "Photo booth rental Vancouver",
    "Photo booth rental Richmond",
    "Wedding photo booth Vancouver",
    "Corporate photo booth Vancouver",
    "Party photo booth rental",
    "Unlimited prints photo booth",
    "Custom photo booth templates",
    "Gold photo booth",
    "43 inch touch screen photo booth",
  ],
};

export default function Home() {
  return <ViboLandingPage />;
}
