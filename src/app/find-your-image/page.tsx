import type { Metadata } from "next";
import { FindImageClient } from "@/components/gallery/find-image-client";

export const metadata: Metadata = {
  title: "Find Your Image | Vibo Photo Booth",
  description: "Find your Vibo Photo Booth gallery using your phone number.",
};

export default function FindYourImagePage() {
  return <FindImageClient />;
}

