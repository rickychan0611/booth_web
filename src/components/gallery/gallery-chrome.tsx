import Image from "next/image";
import Link from "next/link";

const VIBO_WEBSITE = "https://vibobooth.com";
const VIBO_EMAIL = "vibobooth@gmail.com";

export function GalleryHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0a08]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={VIBO_WEBSITE} className="inline-flex items-center gap-3">
          <Image
            src="/vibo-logo.png"
            alt="Vibo Photo Booth"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="font-semibold tracking-wide text-amber-300">Vibo Photo Booth</span>
        </a>
        <Link href="/find-your-image" className="text-sm font-semibold text-white/80 hover:text-amber-300">
          Find Your Image
        </Link>
      </div>
    </header>
  );
}

export function GalleryFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[#0b0a08] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-3">
          <a href={VIBO_WEBSITE}>
            <Image
              src="/vibo-logo.png"
              alt="Vibo Photo Booth"
              width={40}
              height={40}
              className="h-10 w-10"
            />
          </a>
          <p className="text-lg font-bold text-amber-300">Vibo Photo Booth</p>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
          Planning your own wedding, party, or corporate event? Vibo offers premium photo booth rentals
          across Vancouver and the Lower Mainland — with unlimited prints, custom templates, and an online
          gallery for your guests.
        </p>

        <div className="mt-5 space-y-1 text-sm leading-7">
          <p className="font-semibold text-amber-300">Photo booth rental inquiries</p>
          <p className="text-white/75">
            Website:{" "}
            <a href={VIBO_WEBSITE} className="font-medium text-white underline-offset-2 hover:underline">
              vibobooth.com
            </a>
          </p>
          <p className="text-white/75">
            Email:{" "}
            <a href={`mailto:${VIBO_EMAIL}`} className="font-medium text-white underline-offset-2 hover:underline">
              {VIBO_EMAIL}
            </a>
          </p>
        </div>

        <p className="mt-8 text-xs text-white/45">&copy; 2026 Vibo Photo Booth. All rights reserved.</p>
      </div>
    </footer>
  );
}
