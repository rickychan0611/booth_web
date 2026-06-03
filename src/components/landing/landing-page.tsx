import type { LandingContent } from "@/types/database";

export function LandingPage({ content }: { content: LandingContent }) {
  const { colors, sections } = content;

  return (
    <main style={{ background: colors.background, color: colors.foreground }}>
      <section className="px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: colors.accent }}>
            {content.businessName}
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black sm:text-7xl">{content.headline}</h1>
          {content.subheadline ? <p className="mt-5 max-w-2xl text-lg opacity-80">{content.subheadline}</p> : null}
          <a
            href="#cta"
            className="mt-8 inline-flex rounded-md px-5 py-3 text-sm font-bold"
            style={{ background: colors.accent, color: colors.background }}
          >
            {content.ctaText}
          </a>
        </div>
      </section>

      {sections.howItWorks?.length ? (
        <section className="px-5 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold">How it works</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {sections.howItWorks.map((step, index) => (
                <div key={step} className="rounded-md border border-current/20 p-4">
                  <p className="text-sm font-bold" style={{ color: colors.accent }}>
                    Step {index + 1}
                  </p>
                  <p className="mt-2">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {sections.packages?.length ? (
        <section className="px-5 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold">Packages</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {sections.packages.map((pkg) => (
                <div key={pkg.name} className="rounded-md border border-current/20 p-5">
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  {pkg.price ? <p className="mt-1 text-2xl font-black">{pkg.price}</p> : null}
                  <p className="mt-3 opacity-80">{pkg.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {sections.eventDetails ? (
        <section className="px-5 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold">Event details</h2>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {Object.entries(sections.eventDetails).map(([key, value]) => (
                <div key={key} className="rounded-md border border-current/20 p-4">
                  <dt className="text-sm font-bold uppercase opacity-60">{key}</dt>
                  <dd className="mt-1 text-lg font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {sections.faq?.length ? (
        <section className="px-5 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold">FAQ</h2>
            <div className="mt-6 grid gap-3">
              {sections.faq.map((item) => (
                <details key={item.question} className="rounded-md border border-current/20 p-4">
                  <summary className="cursor-pointer font-bold">{item.question}</summary>
                  <p className="mt-2 opacity-80">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="cta" className="px-5 py-16">
        <div className="mx-auto max-w-5xl rounded-md p-8" style={{ background: colors.accent, color: colors.background }}>
          <h2 className="text-3xl font-black">{content.headline}</h2>
          <p className="mt-3 max-w-xl opacity-90">{content.subheadline}</p>
          <a href="mailto:hello@example.com" className="mt-6 inline-flex rounded-md bg-black px-5 py-3 text-sm font-bold text-white">
            {content.ctaText}
          </a>
        </div>
      </section>
    </main>
  );
}
