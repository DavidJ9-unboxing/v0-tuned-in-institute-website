import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/site/section-label'
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
      {/* Header */}
      <section className="border-b border-stone bg-paper">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-deep-teal hover:text-teal-mid"
          >
            <ArrowLeft className="size-4" /> All programs
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={
                'font-sans text-[11px] font-semibold uppercase tracking-[0.14em] ' +
                (comingSoon ? 'text-amber' : 'text-sage-deep')
              }
            >
              {program.status}
            </span>
            <span className="text-charcoal/30">·</span>
            <span className="font-sans text-xs font-medium uppercase tracking-[0.12em] text-charcoal/55">
              {program.modules} modules
            </span>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-deep-teal text-balance sm:text-5xl">
            {program.name}
          </h1>
          <p className="mt-3 font-sans text-sm font-medium text-teal-mid">{program.age}</p>
          <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-charcoal/85">
            {program.description}
          </p>
        </div>
      </section>

      {/* Curriculum + sidebar */}
      <section className="bg-off-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.4fr_0.6fr]">
          <div>
            <SectionLabel>The curriculum</SectionLabel>
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
              <Button
                asChild
                size="lg"
                className="mt-7 w-full bg-deep-teal font-sans font-semibold text-off-white hover:bg-teal-deep"
              >
                <Link href="/membership">
                  {comingSoon ? 'Join to get early access' : 'Become a Member'}
                </Link>
              </Button>
              <p className="mt-3 text-center font-sans text-xs text-charcoal/55">
                One membership unlocks all four programs.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
