"use client";

import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { Check, Download, Images, Mail, MapPin, Monitor, Wand2 } from "lucide-react";
import { useState } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const images = {
  hero: "/images/hero-vibo-booth-event.png",
  fullSetup: "/images/vibo-booth-full-setup.jpg",
  frame: "/images/vibo-gold-frame-closeup.jpg",
  touchscreen: "/images/guests-using-touchscreen.jpg",
  propsGuests: "/images/guests-posing-with-props.jpg",
  template: "/images/custom-print-template.jpg",
  backdrop: "/images/gold-backdrop-setup.jpg",
  props: "/images/props-table.jpg",
  gallery: "/images/online-gallery-preview.jpg",
  video: "/images/video-feature-preview.jpg",
  wedding: "/images/wedding-vibo-setup.jpg",
  corporate: "/images/corporate-vibo-setup.jpg",
  birthday: "/images/birthday-vibo-setup.jpg",
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
    image: images.template,
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

const galleryItems = [
  ["Luxury booth setup", images.hero],
  ["Gold framed touch screen", images.fullSetup],
  ["Guests using the booth", images.touchscreen],
  ["Fun props and poses", images.propsGuests],
  ["Custom event print", images.template],
  ["Gold backdrop", images.backdrop],
  ["Props included", images.props],
  ["Online gallery", images.gallery],
  ["Video feature", images.video],
] as const;

const packages = [
  {
    name: "Classic",
    price: "From $499",
    text: "A polished booth experience for shorter parties and family celebrations.",
    features: ["Unlimited prints", "Props table", "Online gallery", "Custom template"],
  },
  {
    name: "Signature",
    price: "From $799",
    text: "The full Vibo setup for weddings, birthdays, and high-energy private events.",
    features: ["Gold backdrop", "Attendant available", "Premium template", "Full event support"],
  },
  {
    name: "Brand",
    price: "Custom",
    text: "A branded booth experience for corporate events, launches, and school events.",
    features: ["Logo-ready screens", "Branded print design", "Gallery delivery", "Custom setup options"],
  },
];

const faqs = [
  ["Where do you serve?", "Vibo Photo Booth serves Vancouver, Richmond, Burnaby, Surrey, and the Lower Mainland."],
  ["Are prints unlimited?", "Yes, unlimited prints can be included so guests can enjoy the booth throughout the event."],
  ["Can the design match my event?", "Yes. Custom photo booth templates can be made for weddings, parties, and corporate branding."],
  ["Do guests get digital photos?", "Yes. Guests can access photos through a private online gallery after upload."],
];

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

  return (
    <main className="bg-[#0b0a08] text-white">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-semibold tracking-wide text-amber-300">
            Vibo Photo Booth
          </Link>
          <div className="hidden items-center gap-6 text-sm text-white/78 md:flex">
            <a href="#features">Features</a>
            <a href="#gallery">Gallery</a>
            <a href="#packages">Packages</a>
            <a href="#faq">FAQ</a>
            <a href="#book">Book Now</a>
          </div>
          <a href="#book" className="rounded-md bg-gradient-to-br from-amber-300 to-amber-600 px-4 py-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.18)] transition-transform hover:scale-95">
            Check Availability
          </a>
        </nav>
      </header>

      <section className="relative flex h-screen items-center justify-center overflow-hidden px-5 text-center">
        <Image src={images.hero} alt="Luxury Vibo Photo Booth event setup" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/42 to-[#0b0a08]" />

        <div className="relative z-10 mx-auto max-w-4xl pt-16">
          <span className="inline-block rounded-full border border-amber-300/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Luxury Gold Photo Booth
          </span>
          <h1 className={`${playfair.className} mt-6 text-5xl font-bold leading-tight sm:text-7xl lg:text-8xl`}>
            Make Your Event <span className="text-amber-300 italic">Unforgettable</span> With Vibo
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/72">
            A luxury gold framed 43 inch touch screen photo booth with unlimited prints, custom templates, fun props,
            online gallery, and a beautiful event-ready setup your guests will love.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#book" className="w-full rounded-md bg-gradient-to-br from-amber-300 to-amber-600 px-10 py-4 text-sm font-bold text-black shadow-[0_0_22px_rgba(212,175,55,0.2)] transition-transform hover:scale-95 sm:w-auto">
              Check Availability
            </a>
            <a href="#packages" className="w-full rounded-md border border-amber-300/40 px-10 py-4 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-300/5 sm:w-auto">
              View Packages
            </a>
          </div>
          <div className="mt-12 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/48">
            <MapPin size={18} className="text-amber-300/75" />
            Serving Vancouver, Richmond, Burnaby, Surrey, and the Lower Mainland.
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-16 sm:px-6">
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

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Designed to look beautiful</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">A gold framed setup that belongs in the room.</h2>
            <p className="mt-4 max-w-xl text-white/70">
              Vibo Photo Booth is built for event photos before the session even starts: black body, gold frame, warm
              backdrop, and a clean full setup your guests notice right away.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PhotoFrame src={images.fullSetup} alt="Vibo Photo Booth full setup" className="aspect-[4/5] sm:row-span-2 sm:min-h-[460px]" />
            <PhotoFrame src={images.frame} alt="Gold frame close up" className="aspect-[4/3]" />
            <PhotoFrame src={images.backdrop} alt="Gold backdrop setup" className="aspect-[4/3]" />
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
                <PhotoFrame src={item.image} alt={item.title} className="aspect-[4/5] border-0" />
                <div className="p-4">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-black sm:text-5xl">Capture the Magic</h2>
          <div className="mt-12 columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
            {galleryItems.map(([caption, src], index) => (
              <figure key={caption} className="group relative mb-6 break-inside-avoid overflow-hidden rounded-lg border border-amber-300/10 bg-white/[0.04]">
                <div className={index === 4 ? "relative aspect-[4/5]" : index === 0 || index === 5 ? "relative aspect-[5/4]" : "relative aspect-[4/3]"}>
                  <Image src={src} alt={caption} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-amber-300/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-full bg-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-black">
                    {caption}
                  </span>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="bg-[#f5efe1] px-4 py-16 text-neutral-950 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">Packages</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Choose the event experience that fits.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {packages.map((item) => (
              <article key={item.name} className="rounded-md border border-black/10 bg-white p-6">
                <h3 className="text-2xl font-black">{item.name}</h3>
                <p className="mt-2 text-3xl font-black text-amber-700">{item.price}</p>
                <p className="mt-3 text-neutral-600">{item.text}</p>
                <ul className="mt-5 grid gap-3 text-sm font-semibold">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check size={16} className="text-amber-700" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-16 sm:px-6">
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

      <section id="book" className="bg-white px-4 py-16 text-neutral-950 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Book now</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Check availability for your date.</h2>
            <p className="mt-4 max-w-xl text-neutral-600">
              Tell us your event date, city, and package interest. Vibo Photo Booth will follow up with availability,
              package fit, and next steps.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-neutral-700">
              <Mail size={17} />
              hello@vibophotobooth.com
            </div>
          </div>
          <form
            className="grid gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Name
                <input required className="rounded-md border border-neutral-300 bg-white px-3 py-3" placeholder="Your name" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email
                <input required type="email" className="rounded-md border border-neutral-300 bg-white px-3 py-3" placeholder="you@example.com" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Event date
                <input type="date" className="rounded-md border border-neutral-300 bg-white px-3 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                City
                <input className="rounded-md border border-neutral-300 bg-white px-3 py-3" placeholder="Vancouver, Richmond..." />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Event notes
              <textarea className="min-h-28 rounded-md border border-neutral-300 bg-white px-3 py-3" placeholder="Wedding, birthday, corporate party, school event..." />
            </label>
            <button className="rounded-md bg-black px-5 py-3 text-sm font-bold text-white" type="submit">
              Check Availability
            </button>
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
            <p className="text-lg font-bold text-amber-100">Vibo Photo Booth</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              Luxury gold photo booth rental for weddings, parties, corporate events, and celebrations in Vancouver
              and the Lower Mainland.
            </p>
          </div>
          <div className="text-sm leading-7 text-white/70">
            <p>Email: hello@vibophotobooth.com</p>
            <p>Phone: 000-000-0000</p>
            <p>Instagram: @vibophotobooth</p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-7xl text-xs text-white/45">&copy; 2026 Vibo Photo Booth. All rights reserved.</p>
      </footer>
    </main>
  );
}
