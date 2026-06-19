import type { Metadata } from "next";
import { Suspense } from "react";
import { FindImageClient } from "@/components/gallery/find-image-client";

export const metadata: Metadata = {
  title: "Find Your Image | Vibo Photo Booth",
  description: "Find your Vibo Photo Booth gallery using your phone number.",
};

export default function FindYourImagePage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-neutral-100 text-neutral-600">
          Loading...
        </div>
      }
    >
      <FindImageClient />
    </Suspense>
  );
}

