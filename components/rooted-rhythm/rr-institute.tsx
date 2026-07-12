import Image from 'next/image'
import Link from 'next/link'

export function RrInstitute() {
  return (
    <section id="institute" className="bg-rr-cream">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid items-center gap-12 rounded-[2rem] border border-rr-line bg-rr-linen/60 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-rr-terracotta">
              The Tuned In Institute
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-rr-navy text-balance">
              Where the science of sensitivity meets everyday life.
            </h2>
            <p className="mt-5 font-sans text-lg leading-relaxed text-rr-ink">
              Rooted Rhythm&apos;s research and education arm turns clinical insight into books,
              courses, and self-help tools you can use at home — including the{' '}
              <em className="font-display italic text-rr-navy">Tuned In</em> book collection by
              founder Sophie Schauermann, LCSW.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-rr-navy px-7 py-3.5 font-sans text-base font-semibold text-rr-cream transition-colors hover:bg-rr-navy-deep"
              >
                Explore the Institute
              </Link>
              <Link
                href="/tuned-in-book-for-adults"
                className="inline-flex items-center justify-center rounded-full border border-rr-navy/25 px-7 py-3.5 font-sans text-base font-semibold text-rr-navy transition-colors hover:bg-rr-navy hover:text-rr-cream"
              >
                See the Books
              </Link>
            </div>
          </div>

          <div className="order-1 flex items-end justify-center gap-5 lg:order-2">
            <Image
              src="/images/tuned-in-book-cover.png"
              alt="Tuned In: A Guide for Parents of Sensitive Children"
              width={280}
              height={420}
              className="w-36 rotate-[-4deg] rounded-md shadow-[0_24px_45px_-20px_rgba(51,65,90,0.5)] sm:w-44"
            />
            <Image
              src="/images/tuned-in-adults-book-cover.png"
              alt="Tuned In: A Guide to Reconnecting with Yourself"
              width={280}
              height={420}
              className="w-36 rotate-[4deg] rounded-md shadow-[0_24px_45px_-20px_rgba(51,65,90,0.5)] sm:w-44"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
