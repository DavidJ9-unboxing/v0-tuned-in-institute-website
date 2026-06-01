import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AccessCta } from '@/components/site/access-cta'
import { PageHero } from '@/components/site/page-hero'
import { SectionLabel } from '@/components/site/section-label'
import { clinicalFoundations } from '@/lib/site'

export const metadata: Metadata = {
  title: 'What Is Sensitivity',
  description:
    'We all have sensitivities. Explore the Tuned In philosophy of sensitivity, why modern life can feel overwhelming, and how understanding your nervous system changes everything.',
}

const traits = [
  {
    letter: '01',
    title: 'Depth of processing',
    body: 'Sensitive people process information more thoroughly, noticing connections and implications others miss. This is the engine of their creativity, empathy, and insight.',
  },
  {
    letter: '02',
    title: 'Overstimulation',
    body: 'Because they take in and process more, sensitive nervous systems reach their limit sooner. What looks like a meltdown is often a system that is simply full.',
  },
  {
    letter: '03',
    title: 'Emotional responsiveness and empathy',
    body: 'Sensitive people feel their own emotions intensely and attune deeply to the emotions of others. They are often the first to sense when something is wrong.',
  },
  {
    letter: '04',
    title: 'Sensitivity to subtleties',
    body: 'A change in tone, a flickering light, a scratchy tag, a shift in someone\u2019s mood. The sensitive system registers fine details that most people filter out entirely.',
  },
]

export default function WhatIsSensitivityPage() {
  return (
    <>
      <PageHero
        label="Our philosophy"
        title="What does it mean to be sensitive?"
        intro="We all have sensitivities. Some of us feel the world more intensely, and in a fast, loud, overstimulating world, almost anyone can end up overwhelmed and dysregulated. Sensitivity is not a disorder, a phase, or a flaw. It is part of being human, and it can be understood, honored, and worked with."
      />

      {/* DOES framework */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <SectionLabel>How sensitivity shows up</SectionLabel>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Four ways sensitivity tends to show up.
          </h2>
          <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-charcoal/85">
            Sensitivity looks different for everyone, but a few patterns show up again and again. To
            different degrees, most of us recognize ourselves in these.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {traits.map((t) => (
              <div key={t.letter} className="rounded-xl border border-stone bg-card p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sage-light font-serif text-2xl font-semibold text-deep-teal">
                  {t.letter}
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-deep-teal">{t.title}</h3>
                <p className="mt-3 font-serif text-[15px] leading-relaxed text-charcoal/80">
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical foundations */}
      <section className="border-t border-stone bg-deep-teal text-off-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <p className="section-label !text-sage-light">How we practice</p>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            The foundations behind our work.
          </h2>
          <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-off-white/80">
            Our approach is clinical first, informed by research. These are the principles our
            therapists and educators return to in every session and every program.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {clinicalFoundations.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-off-white/15 bg-teal-deep/40 p-6"
              >
                <span className="block h-1 w-8 bg-sage" />
                <h3 className="mt-4 font-serif text-lg font-semibold leading-snug">{f.title}</h3>
                <p className="mt-3 font-serif text-sm leading-relaxed text-off-white/80">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Ready to put the science to work?
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-charcoal/85">
            Our programs translate every one of these findings into tools you can use with the
            sensitive person in your life, including yourself.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-deep-teal font-sans font-semibold text-off-white hover:bg-teal-deep"
            >
              <Link href="/programs">Explore the Programs</Link>
            </Button>
            <AccessCta
              variant="outline"
              className="border-deep-teal font-sans font-semibold text-deep-teal hover:bg-deep-teal hover:text-off-white"
            />
          </div>
        </div>
      </section>
    </>
  )
}
