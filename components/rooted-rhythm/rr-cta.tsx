export function RrCta() {
  return (
    <section id="consult" className="bg-rr-teal">
      <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 lg:py-28">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-rr-cream/60">
          Start here
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight text-rr-cream text-balance sm:text-5xl">
          Your family doesn&apos;t have to figure this out alone.
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-sans text-lg leading-relaxed text-rr-cream/80">
          Book a free 15-minute consult. We&apos;ll listen, answer your questions, and help you find
          the right next step — no pressure, no jargon.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:hello@rootedrhythm.com"
            className="inline-flex items-center justify-center rounded-full bg-rr-terracotta px-8 py-4 font-sans text-base font-semibold text-rr-cream shadow-sm transition-colors hover:bg-rr-terracotta-deep"
          >
            Book a Free Consult
          </a>
          <a
            href="#support"
            className="inline-flex items-center justify-center rounded-full border border-rr-cream/30 px-8 py-4 font-sans text-base font-semibold text-rr-cream transition-colors hover:bg-rr-cream hover:text-rr-teal"
          >
            Explore Our Care
          </a>
        </div>
      </div>
    </section>
  )
}
