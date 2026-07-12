import Image from 'next/image'
import { Star } from 'lucide-react'

export function RrHero() {
  return (
    <section id="top" className="relative overflow-hidden bg-rr-linen">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-16">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-rr-terracotta">
            <span className="h-px w-6 bg-rr-terracotta" aria-hidden="true" />
            Play therapy · Parent coaching · Adult therapy
          </p>

          <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.05] text-rr-navy text-balance sm:text-6xl">
            Support for sensitive children, teens &amp; adults.
          </h1>

          <p className="mt-6 font-sans text-lg leading-relaxed text-rr-ink">
            Big feelings aren&apos;t a problem to fix. At Rooted Rhythm, we help sensitive people and
            their families understand how they&apos;re wired&nbsp;— and build the tools to feel
            steady, connected, and at home in themselves.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#consult"
              className="inline-flex items-center justify-center rounded-full bg-rr-terracotta px-7 py-3.5 font-sans text-base font-semibold text-rr-cream shadow-sm transition-colors hover:bg-rr-terracotta-deep"
            >
              Book a Free Consult
            </a>
            <a
              href="#support"
              className="inline-flex items-center justify-center rounded-full border border-rr-navy/25 bg-transparent px-7 py-3.5 font-sans text-base font-semibold text-rr-navy transition-colors hover:bg-rr-navy hover:text-rr-cream"
            >
              Explore Our Care
            </a>
          </div>

          <div className="mt-9 flex items-center gap-3">
            <div className="flex text-rr-gold" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <p className="font-sans text-sm text-rr-ink">
              Trusted by <span className="font-semibold text-rr-navy">2,000+ families</span> across
              four states
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[1.75rem] shadow-[0_30px_60px_-30px_rgba(51,65,90,0.4)]">
            <Image
              src="/images/rooted-rhythm/hero-calm.png"
              alt="A calm, sunlit reading corner with a soft armchair, plants, and warm natural light"
              width={1024}
              height={1024}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-rr-line bg-rr-cream px-5 py-4 shadow-lg sm:block">
            <p className="font-display text-2xl font-semibold text-rr-navy">Licensed care</p>
            <p className="font-sans text-xs text-rr-ink">CO · TX · GA · NJ · virtual coaching</p>
          </div>
        </div>
      </div>
    </section>
  )
}
