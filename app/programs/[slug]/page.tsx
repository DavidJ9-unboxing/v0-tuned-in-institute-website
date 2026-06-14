import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import { SectionLabel } from '@/components/site/section-label'
import { MembershipCta, AccessCta, SignInCta } from '@/components/site/access-cta'
import { programs } from '@/lib/site'

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const program = programs.find((p) => p.slug === slug)
  if (!program) return { title: 'Program' }
  return { title: program.name, description: program.description }
}

const includes = [
  'Video lessons for every module',
  'Audio versions for listening on the go',
  'Full written transcripts',
  'Downloadable worksheets and scripts',
  'Lifetime access through membership',
  'All future updates to the course',
]

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const program = programs.find((p) => p.slug === slug)
  if (!program) notFound()

  const status = program.status.toLowerCase()
  const comingSoon = status.includes('coming') || status.includes('launching')

  return (
    <>
      {/* Hero */}
      <section className="border-b border-stone bg-deep-teal text-off-white">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-off-white/80 transition-colors hover:text-sage-light"
          >
            <ArrowLeft className="size-4" /> All programs
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-off-white/10 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-light">
              <Sparkles className="size-3" /> {program.status}
            </span>
            <span className="font-sans text-xs font-medium uppercase tracking-[0.12em] text-off-white/60">
              {program.modules} modules
            </span>
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            {program.name}
          </h1>
          <p className="mt-3 font-sans text-sm font-medium text-sage-light">{program.age}</p>
          {program.tagline && (
            <p className="mt-7 max-w-2xl font-serif text-xl leading-relaxed text-off-white/90 text-pretty sm:text-2xl">
              {program.tagline}
            </p>
          )}
        </div>
      </section>

      {/* Overview */}
      {program.overview && (
        <section className="border-b border-stone bg-paper">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 md:py-20">
            <SectionLabel>What this course is</SectionLabel>
            <div className="mt-6 space-y-5">
              {program.overview.map((para) => (
                <p
                  key={para.slice(0, 32)}
                  className="font-serif text-lg leading-relaxed text-charcoal/85"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Who it's for + What you'll walk away with */}
      {(program.forWho || program.outcomes) && (
        <section className="border-b border-stone bg-off-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-20">
            {program.forWho && (
              <div>
                <SectionLabel>Who it&apos;s for</SectionLabel>
                <ul className="mt-6 space-y-3">
                  {program.forWho.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 font-serif text-lg leading-relaxed text-charcoal/85"
                    >
                      <span className="mt-3 size-1.5 shrink-0 rounded-full bg-sage-deep" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {program.outcomes && (
              <div>
                <SectionLabel>What you&apos;ll walk away with</SectionLabel>
                <ul className="mt-6 space-y-3">
                  {program.outcomes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 font-sans text-[15px] leading-relaxed text-charcoal/80"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-sage-deep" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* The journey arc */}
      {program.journey && (
        <section className="border-b border-stone bg-paper">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
            <SectionLabel>How the journey unfolds</SectionLabel>
            <h2 className="mt-5 max-w-2xl font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance">
              A path designed to meet you where you are.
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {program.journey.map((phase, i) => (
                <li
                  key={phase.title}
                  className="rounded-xl border border-stone bg-card p-7"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-sage-light font-serif text-base font-semibold text-deep-teal">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 font-serif text-xl font-semibold text-deep-teal">
                    {phase.title}
                  </h3>
                  <p className="mt-3 font-serif text-[15px] leading-relaxed text-charcoal/80">
                    {phase.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Curriculum + sidebar */}
      <section className="bg-off-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.4fr_0.6fr]">
          <div>
            <SectionLabel>The full curriculum</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-semibold text-deep-teal">
              {program.modules} modules
            </h2>
            <ol className="mt-8 space-y-px overflow-hidden rounded-xl border border-stone">
              {program.moduleList.map((module, i) => {
                const title = typeof module === 'string' ? module : module.title
                const points = typeof module === 'string' ? [] : module.points
                return (
                  <li
                    key={title}
                    className="flex items-start gap-4 bg-card px-6 py-5 transition-colors hover:bg-paper"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sage-light font-serif text-sm font-semibold text-deep-teal">
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-2">
                      <span className="font-serif text-[17px] leading-snug text-charcoal/85">
                        {title}
                      </span>
                      {points.length > 0 && (
                        <ul className="space-y-1.5">
                          {points.map((point) => (
                            <li
                              key={point}
                              className="flex gap-2.5 font-sans text-sm leading-relaxed text-charcoal/65"
                            >
                              <span className="mt-2 size-1 shrink-0 rounded-full bg-sage-deep" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          <aside className="md:sticky md:top-24 md:self-start">
            <div className="rounded-xl border border-stone bg-card p-7">
              <h3 className="font-serif text-xl font-semibold text-deep-teal">
                What&apos;s included
              </h3>
              <ul className="mt-5 space-y-3">
                {includes.map((item) => (
                  <li key={item} className="flex gap-3 font-sans text-sm leading-relaxed text-charcoal/80">
                    <Check className="mt-0.5 size-4 shrink-0 text-sage-deep" />
                    {item}
                  </li>
                ))}
              </ul>
              <MembershipCta comingSoon={comingSoon} />
            </div>
          </aside>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-stone bg-deep-teal text-off-white">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            One membership unlocks every program.
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-off-white/85">
            Get this course, all four tracks, the full resource library, and every new program as
            it&apos;s released.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <AccessCta className="bg-off-white font-sans font-semibold text-deep-teal hover:bg-off-white/90" />
            <SignInCta className="border-off-white/40 bg-transparent font-sans font-semibold text-off-white hover:bg-off-white hover:text-deep-teal" />
          </div>
        </div>
      </section>
    </>
  )
}
