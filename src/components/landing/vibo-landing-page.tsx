"use client";

import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import {
  Camera,
  Check,
  Cloud,
  Download,
  Gem,
  Gift,
  Hash,
  Images,
  Info,
  Mail,
  MapPin,
  Menu,
  Minus,
  Monitor,
  PartyPopper,
  PenLine,
  Printer,
  Smartphone,
  Sparkles,
  User,
  Users,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { useState, type FormEvent, type MouseEvent } from "react";
import { faqs } from "@/components/landing/vibo-faqs";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const images = {
  hero: "/booth-hero2.png",
  touchscreen: "/images/Designed_photobooth.jpg",
  propsGuests: "/images/Perfect_private_party.png",
  template: "/images/What_custom_Print.png",
  backdrop: "/images/What_gold_Backdrop.png",
  props: "/images/What_Props_Table.png",
  gallery: "/images/online-gallery.png",
  wedding: "/images/wedding.jpg",
  corporate: "/images/Perfect_corporate.png",
  birthday: "/images/birthday.webp",
  unlimited: "/images/unlimited-prints.jpg",
};

const guestFeatures = [
  {
    title: "Big touch screen",
    text: "A bright 43 inch touch screen makes every guest interaction feel simple, playful, and premium.",
    image: images.touchscreen,
    icon: Monitor,
  },
  {
    title: "Unlimited prints",
    text: "Guests can leave with real keepsakes while your event stays moving.",
    image: images.unlimited,
    icon: Download,
  },
  {
    title: "Custom templates",
    text: "Gold and black print designs can be personalized for weddings, birthdays, launches, and parties.",
    image: images.template,
    icon: Wand2,
  },
  {
    title: "Online gallery",
    text: "Photos are uploaded to a clean mobile-friendly gallery guests can open after the event.",
    image: images.gallery,
    icon: Images,
  },
];

const included = [
  { title: "Props table", text: "Organized props, signs, glasses, and party pieces.", image: images.props },
  { title: "Gold backdrop", text: "A clean premium setup that looks ready for photos.", image: images.backdrop },
  { title: "Custom print design", text: "A personalized keepsake matched to your event.", image: images.template },
];

const celebrations = [
  { title: "Weddings", text: "Elegant, warm, and guest-friendly for receptions and cocktail hours.", image: images.wedding },
  { title: "Corporate events", text: "A polished branded experience for company parties and launches.", image: images.corporate },
  { title: "Birthdays", text: "Fun, colorful, and still clean enough for beautiful keepsakes.", image: images.birthday },
  { title: "Private parties", text: "Props, poses, prints, and an easy way to keep guests laughing.", image: images.propsGuests },
];

const galleryFilenames = [
  "photo.jpg",
  "photo (1).jpg",
  "photo (1).jpeg",
  "photo (2).jpg",
  "photo (3).jpg",
  "photo (4).jpg",
  "photo (5).png",
  "photo (6).jpg",
  "photo (7).jpg",
  "photo (8).jpg",
  "photo (9).jpg",
  "photo (10).jpg",
  "photo (11).jpg",
] as const;

function galleryPhotoPath(filename: string) {
  return `/images/gallery/${encodeURIComponent(filename)}`;
}

function galleryCaption(filename: string) {
  if (filename === "wedding.jpg") return "Vibo wedding photo booth in Vancouver";
  const match = filename.match(/photo \((\d+)\)/i);
  return match
    ? `Vibo Photo Booth Vancouver event photo ${match[1]}`
    : "Vibo Photo Booth Vancouver event photo";
}

function galleryAspectClass(index: number) {
  if (index % 6 === 0) return "relative aspect-[5/4]";
  if (index % 5 === 2) return "relative aspect-[3/4]";
  return "relative aspect-[4/3]";
}

const galleryItems = galleryFilenames.map((filename) => ({
  caption: galleryCaption(filename),
  src: galleryPhotoPath(filename),
}));

const pricingFeatureLabels = [
  "Professional Attendant",
  "Unlimited Print Sessions",
  "Instant Digital Sharing",
  "Online Gallery Access",
  "Custom Event Template",
  "Personalized Welcome Screen",
  "Premium Setup Experience",
  "Corporate Branding Support",
  "6 Complimentary Custom Props",
] as const;

const pricingPackages = [
  {
    name: "ESSENTIALS",
    price: "$400",
    duration: "2 HOURS",
    popular: false,
    accent: "teal" as const,
    included: [true, true, true, true, true, false, false, false, true],
    footer: "Perfect for birthdays, graduations, and private celebrations.",
    footerIcon: PartyPopper,
  },
  {
    name: "SIGNATURE",
    price: "$450",
    duration: "2 HOURS",
    popular: true,
    accent: "orange" as const,
    included: [true, true, true, true, true, true, true, false, true],
    footer: "Ideal for weddings and corporate events. Includes premium setup and personalized event branding.",
    footerIcon: Gem,
  },
  {
    name: "CORPORATE & PREMIUM",
    price: "$700",
    duration: "4 HOURS",
    popular: false,
    accent: "teal" as const,
    included: [true, true, true, true, true, true, true, true, true],
    footer: "Best for larger weddings, corporate functions, trade shows, and branded activations.",
    footerIcon: Users,
  },
] as const;

const allPackagesInclude = [
  { label: "Professional Attendant", icon: User },
  { label: "Unlimited Print Sessions", icon: Printer },
  { label: "Instant Digital Sharing", icon: Smartphone },
  { label: "Online Gallery Access", icon: Cloud },
  { label: "Custom Event Template", icon: PenLine },
] as const;

const pricingAddOns = [
  { label: "GIF & Video Experience", price: "+$100", icon: Video, status: "available" as const },
  { label: "Glam Filter (2-4 Modes)", price: "+$50", icon: Sparkles, status: "available" as const },
  { label: "Custom Event Hashtag Slide", price: "+$25", icon: Hash, status: "available" as const },
  { label: "Video Guest Book (Not Available Yet)", price: "COMING SOON", icon: Camera, status: "soon" as const },
] as const;

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#packages", label: "Packages" },
  { href: "#gallery", label: "Gallery" },
  { href: "#faq", label: "FAQ" },
  { href: "#book", label: "Book Now" },
] as const;


function scrollToSection(href: string) {
  const id = href.slice(1);
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleSectionLink(event: MouseEvent<HTMLAnchorElement>, href: string, onNavigate?: () => void) {
  if (!href.startsWith("#")) return;
  event.preventDefault();
  scrollToSection(href);
  onNavigate?.();
}

function PhotoFrame({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-md border border-amber-300/30 bg-black ${className}`}>
      <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
    </div>
  );
}

export function ViboLandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [summerPromoVisible, setSummerPromoVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    eventDate: "",
    city: "",
    notes: "",
  });

  function dismissSummerPromo() {
    setSummerPromoVisible(false);
  }

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to submit booking request");
      }

      setSubmitted(true);
      setBookingForm({
        name: "",
        email: "",
        eventDate: "",
        city: "",
        notes: "",
      });
    } catch (submitError) {
      setSubmitError(submitError instanceof Error ? submitError.message : "Unable to submit booking request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-[#0b0a08] text-white">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <Menu size={24} />
          </button>
          <Link href="/" className="inline-flex shrink-0 items-center gap-3">
            <Image
              src="/vibo-logo.png"
              alt="Vibo Booth"
              width={40}
              height={40}
              priority
              className="h-10 w-10"
            />
            <span className="font-semibold tracking-wide text-amber-300">Vibo Photo Booth</span>
          </Link>
          <div className="hidden flex-1 items-center justify-center gap-6 text-sm text-white/78 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(event) => handleSectionLink(event, link.href)}>
                {link.label}
              </a>
            ))}
          </div>
          <Link
            href="/find-your-image"
            className="ml-auto hidden shrink-0 text-sm font-semibold text-white/85 hover:text-amber-300 md:inline"
          >
            Find my photo
          </Link>
          <a
            href="#book"
            onClick={(event) => handleSectionLink(event, "#book")}
            className="ml-auto shrink-0 rounded-md bg-gradient-to-br from-amber-300 to-amber-600 px-4 py-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.18)] transition-transform hover:scale-95 md:ml-0"
          >
            Check Availability
          </a>
        </nav>
        {mobileMenuOpen ? (
          <div className="border-t border-white/10 bg-black/95 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold text-white/90">
              <Link
                href="/find-your-image"
                className="rounded-md px-2 py-2 hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find my photo
              </Link>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-2 py-2 hover:bg-white/5"
                  onClick={(event) => handleSectionLink(event, link.href, () => setMobileMenuOpen(false))}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative bg-[#0b0a08] px-4 pb-16 text-left sm:px-6 sm:pb-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-screen">
          <Image src={images.hero} alt="Vibo gold photo booth rental setup for events in Vancouver" fill priority sizes="100vw" className="object-cover object-right" />
          {/* <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/42 to-[#0b0a08]" /> */}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl pt-[80vh] pb-8 sm:flex sm:min-h-screen sm:items-center sm:py-16 lg:pl-16 xl:pl-24">
          <div className="w-full max-w-4xl">
          <h1 className={`${playfair.className} sm:mt-6 text-5xl font-bold leading-tight sm:text-7xl lg:text-8xl`}>
            Make Your Event <span className="text-amber-300 italic">Unforgettable</span> With Vibo Photo Booth
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            A gold framed 43 inch touch screen photo booth with unlimited prints, custom templates, fun props,
            online gallery, and a beautiful event-ready setup your guests will love.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start sm:justify-start">
            <a
              href="#book"
              onClick={(event) => handleSectionLink(event, "#book")}
              className="w-full rounded-md bg-gradient-to-br from-amber-300 to-amber-600 px-10 py-4 text-center text-sm font-bold text-black shadow-[0_0_22px_rgba(212,175,55,0.2)] transition-transform hover:scale-95 sm:w-auto"
            >
              Check Availability
            </a>
            <a
              href="#packages"
              onClick={(event) => handleSectionLink(event, "#packages")}
              className="w-full rounded-md bg-black px-10 py-4 text-center text-sm font-bold text-white transition-colors hover:bg-neutral-800 sm:w-auto"
            >
              View Packages
            </a>
          </div>
          <div className="mt-12 flex items-center justify-start gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/48">
            <MapPin size={18} className="text-amber-300/75" />
            Serving Vancouver, Richmond, Burnaby, Surrey, and the Lower Mainland.
          </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Why guests love it</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">A booth that feels easy, beautiful, and fun.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {guestFeatures.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-md border border-white/10 bg-white/[0.04]">
                <PhotoFrame src={item.image} alt={item.title} className="aspect-[4/3] border-0" />
                <div className="p-4">
                  <item.icon className="text-amber-300" size={24} />
                  <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 text-neutral-950 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">What's included</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">The polished pieces your event needs.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {included.map((item) => (
              <article key={item.title} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <PhotoFrame src={item.image} alt={item.title} className="aspect-[4/3]" />
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-neutral-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Perfect for any celebration</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Wedding photo booth, party booth, brand booth.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {celebrations.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-md border border-white/10 bg-white/[0.04]">
                <PhotoFrame src={item.image} alt={item.title} className="aspect-[4/3] border-0" />
                <div className="p-4">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="scroll-mt-20 bg-[#f7f4ef] px-4 py-16 text-neutral-950 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-wide text-[#00000] sm:text-4xl">PRICING PACKAGES</h2>
            <p className="mt-2 text-[#00000]">Simple. Transparent. Perfect for Every Event.</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {pricingPackages.map((pkg) => {
              const isOrange = pkg.accent === "orange";
              const headerClass = isOrange ? "bg-[#f1ae48]" : "bg-[#000]";
              const priceClass = isOrange ? "text-[#f1ae48]" : "text-[#000]";
              const checkClass = isOrange ? "text-[#f1ae48]" : "text-[#000]";

              return (
                <article
                  key={pkg.name}
                  className={`flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ${
                    pkg.popular ? "border-2 border-[#f1ae48]" : "border border-neutral-200"
                  }`}
                >
                  {pkg.popular ? (
                    <div className="bg-[#c86d45] px-4 py-1.5 text-center text-xs font-bold tracking-[0.14em] text-white">
                      MOST POPULAR
                    </div>
                  ) : null}
                  <div className={`${headerClass} px-4 py-3 text-center text-lg font-bold tracking-[0.14em] text-white`}>
                    {pkg.name}
                  </div>
                  <div className="px-6 py-6 text-center">
                    <p className={`text-5xl font-black ${priceClass}`}>{pkg.price}</p>
                    <p className="mt-1 text-sm font-semibold tracking-[0.12em] text-neutral-500">{pkg.duration}</p>
                  </div>
                  <ul className="flex-1 space-y-3 px-6 pb-4 text-sm">
                    {pricingFeatureLabels.map((feature, index) => {
                      const label =
                        feature === "6 Complimentary Custom Props" && pkg.price === "$400"
                          ? "4 Complimentary Custom Props"
                          : feature;

                      return (
                        <li key={feature} className="flex items-start gap-2">
                          {pkg.included[index] ? (
                            <Check size={16} className={`mt-0.5 shrink-0 ${checkClass}`} />
                          ) : (
                            <Minus size={16} className="mt-0.5 shrink-0 text-neutral-300" />
                          )}
                          <span className={pkg.included[index] ? "text-neutral-800" : "text-neutral-400"}>{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="px-6 pb-4 text-sm font-semibold text-[#c86d45]">Additional Hours: $100/hr</p>
                  <div className="px-6 pb-6">
                    <a
                      href="#book"
                      onClick={(event) => handleSectionLink(event, "#book")}
                      className={`block rounded-md border-2 px-4 py-3 text-center text-sm font-bold tracking-[0.12em] transition-colors ${
                        isOrange
                          ? "border-[#f1ae48] bg-[#f1ae48] text-white hover:bg-[#f1ae48]"
                          : "border-[#00000] bg-white text-[#00000] hover:bg-neutral-50"
                      }`}
                    >
                      BOOK NOW
                    </a>
                  </div>
                  <div className="flex items-start gap-3 bg-[#f5efe1] px-5 py-4 text-sm leading-6 text-neutral-700">
                    <pkg.footerIcon size={18} className="mt-0.5 shrink-0 text-[#c86d45]" />
                    <p>{pkg.footer}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-lg border border-neutral-200 bg-white p-6">
              <h3 className="text-center text-sm font-bold tracking-[0.14em] text-[#1e4d57]">ALL PACKAGES INCLUDE</h3>
              <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                {allPackagesInclude.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                    <item.icon size={28} className="text-[#1e4d57]" />
                    <p className="text-xs font-semibold leading-5 text-neutral-700">{item.label}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-neutral-200 bg-white p-6">
              <h3 className="text-center text-sm font-bold tracking-[0.14em] text-[#1e4d57]">ADD-ONS</h3>
              <ul className="mt-6 space-y-4">
                {pricingAddOns.map((addon) => (
                  <li key={addon.label} className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <addon.icon size={20} className="shrink-0 text-[#1e4d57]" />
                      <span className="font-medium text-neutral-800">{addon.label}</span>
                    </div>
                    <span className={`shrink-0 font-bold ${addon.status === "soon" ? "text-[#c86d45]" : "text-[#1e4d57]"}`}>
                      {addon.price}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          {/* <div className="mt-8 flex items-center justify-center gap-3 rounded-lg bg-[#f5efe1] px-5 py-4 text-center">
            <Gift size={20} className="shrink-0 text-[#c86d45]" />
            <p className="text-sm font-bold text-[#c86d45] sm:text-base">
              SUMMER PROMOTION: FREE 6 Custom Props Included With Every Booking!
            </p>
          </div> */}

          <p className="mt-6 flex items-start justify-center gap-2 text-center text-xs text-neutral-500">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              Additional hours are available at $100 per hour. Travel fees may apply outside our standard service areas.
            </span>
          </p>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-black sm:text-5xl">Capture the Magic</h2>
          <div className="mt-12 columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
            {galleryItems.map((item, index) => (
              <figure
                key={item.src}
                className="mb-6 break-inside-avoid overflow-hidden rounded-lg border border-amber-300/10"
              >
                <div className={galleryAspectClass(index)}>
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">FAQ</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Good things to know before booking.</h2>
          </div>
          <div className="grid gap-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-md border border-white/10 bg-white/[0.04] p-5">
                <summary className="cursor-pointer font-bold">{question}</summary>
                <p className="mt-3 leading-7 text-white/68">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="book" className="scroll-mt-20 bg-white px-4 py-16 text-neutral-950 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Book now</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Check availability for your date.</h2>
            <p className="mt-4 max-w-xl text-neutral-600">
              Tell us your event date, city, and package interest. Vibo Photo Booth will follow up with availability,
              package fit, and next steps.
            </p>
          </div>
          <form
            className="grid gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-5"
            onSubmit={handleBookingSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Name
                <input
                  required
                  value={bookingForm.name}
                  onChange={(event) => setBookingForm((current) => ({ ...current, name: event.target.value }))}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-3"
                  placeholder="Your name"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email
                <input
                  required
                  type="email"
                  value={bookingForm.email}
                  onChange={(event) => setBookingForm((current) => ({ ...current, email: event.target.value }))}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-3"
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Event date
                <input
                  type="date"
                  value={bookingForm.eventDate}
                  onChange={(event) => setBookingForm((current) => ({ ...current, eventDate: event.target.value }))}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                City
                <input
                  value={bookingForm.city}
                  onChange={(event) => setBookingForm((current) => ({ ...current, city: event.target.value }))}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-3"
                  placeholder="Vancouver, Richmond..."
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Event notes
              <textarea
                value={bookingForm.notes}
                onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))}
                className="min-h-28 rounded-md border border-neutral-300 bg-white px-3 py-3"
                placeholder="Wedding, birthday, corporate party, school event..."
              />
            </label>
            <button
              className="rounded-md bg-black px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Check Availability"}
            </button>
            {submitError ? (
              <p className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-rose-900">
                {submitError}
              </p>
            ) : null}
            {submitted ? (
              <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                Thanks for reaching out to Vibo Photo Booth. We received your booking request and will follow up soon.
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/vibo-logo.png"
                alt="Vibo Booth"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <p className="text-lg font-bold text-amber-300">Vibo Photo Booth</p>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              Gold photo booth rental for weddings, parties, corporate events, and celebrations in Vancouver
              and the Lower Mainland.
            </p>
          </div>
          <div className="text-sm leading-7 text-white/70">
            <p>Email: vibobooth@gmail.com</p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-7xl text-xs text-white/45">&copy; 2026 Vibo Photo Booth. All rights reserved.</p>
      </footer>

      {summerPromoVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-40 md:inset-x-auto md:right-6 md:bottom-6 md:w-[min(28rem,calc(100vw-3rem))]">
          <div className="summer-promo-gradient-border rounded-t-md md:rounded-md">
            <div className="relative overflow-hidden rounded-t-[calc(0.375rem-2px)] md:rounded-[calc(0.375rem-2px)]">
              <button
                type="button"
                onClick={dismissSummerPromo}
                className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full border border-amber-400/60 bg-black/75 text-white backdrop-blur hover:bg-black/90"
                aria-label="Close promotion"
              >
                <X size={16} />
              </button>
              <a
                href="#book"
                onClick={(event) => handleSectionLink(event, "#book")}
                className="block cursor-pointer"
                aria-label="Book now — summer promotion"
              >
                <Image
                  src="/images/summer-promo.png"
                  alt="Limited-time summer promotion: photo booth rental $150 per hour, save 25%"
                  width={1120}
                  height={280}
                  sizes="(max-width: 768px) 100vw, 28rem"
                  className="h-auto w-full object-cover"
                />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
