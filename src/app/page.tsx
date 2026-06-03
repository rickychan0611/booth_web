import Link from "next/link";
import { Camera, MonitorUp, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100 px-5 py-10 text-neutral-950">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-md bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-rose-600">Photo Booth Web System</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black sm:text-6xl">
            Staff queue control, booth validation, and secure guest galleries.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-neutral-600">
            MVP scaffold for manual paid guests first, with Supabase Realtime, private R2 uploads, and Stripe webhook support ready for the next phase.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-md bg-neutral-950 px-4 py-3 text-sm font-bold text-white" href="/admin/events">
              Open Admin
            </Link>
            <Link className="rounded-md border border-neutral-300 px-4 py-3 text-sm font-bold" href="/landing/demo">
              View Demo Landing Page
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Smartphone, title: "Staff", text: "Create paid guests and control queue status from a phone-first page." },
            { icon: MonitorUp, title: "Booth", text: "Validate access codes server-side before Electron starts a session." },
            { icon: Camera, title: "Gallery", text: "Serve private R2 assets through secure, short-lived signed links." },
          ].map((item) => (
            <article key={item.title} className="rounded-md bg-white p-5 shadow-sm">
              <item.icon className="text-rose-600" size={26} />
              <h2 className="mt-4 text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
