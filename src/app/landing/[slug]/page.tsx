import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { createServiceClient } from "@/lib/supabase/server";
import type { LandingContent } from "@/types/database";

export const dynamic = "force-dynamic";

const fallbackContent: LandingContent = {
  businessName: "Booth Pro",
  headline: "A photo booth guests actually remember",
  subheadline: "Fast queues, private galleries, and printable moments for weddings, parties, and brand activations.",
  ctaText: "Book the booth",
  colors: {
    background: "#fff7ed",
    foreground: "#18181b",
    accent: "#e11d48",
  },
  sections: {
    howItWorks: ["Guests get a queue code.", "The booth guides each session.", "Photos land in a private gallery."],
    packages: [
      { name: "Essentials", price: "$499", description: "Great for intimate parties and short events." },
      { name: "Signature", price: "$799", description: "Includes custom print layout and staff support." },
      { name: "Brand", price: "Custom", description: "Built for launches, sponsors, and high-volume activations." },
    ],
    eventDetails: {
      Setup: "Indoor or covered outdoor events",
      Delivery: "Digital gallery plus print-ready layouts",
    },
    faq: [
      { question: "Can guests download their photos?", answer: "Yes, every paid ticket gets a secure gallery link." },
      { question: "Can staff manage the queue?", answer: "Yes, staff can create, skip, cancel, and advance tickets live." },
    ],
  },
};

export default async function LandingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "demo") {
    return <LandingPage content={fallbackContent} />;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.from("landing_pages").select("*").eq("slug", slug).single();

  if (error || !data) {
    notFound();
  }

  return <LandingPage content={data.content_json} />;
}
