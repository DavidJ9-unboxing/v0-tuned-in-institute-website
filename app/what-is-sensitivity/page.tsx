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
    'High sensitivity, or Sensory Processing Sensitivity, is an inherited trait found in 15 to 20 percent of people. Learn the science behind the sensitive nervous system.',
}

const traits = [
  {
    letter: 'D',
    title: 'Depth of processing',
    body: 'Sensitive people process information more thoroughly, noticing connections and implications others miss. This is the engine of their creativity, empathy, and insight.',
  },
  {
    letter: 'O',
    title: 'Overstimulation',
    body: 'Because they take in and process more, sensitive nervous systems reach their limit sooner. What looks like a meltdown is often a system that is simply full.',
  },
  {
    letter: 'E',
    title: 'Emotional responsiveness and empathy',
    body: 'Sensitive people feel their own emotions intensely and attune deeply to the emotions of others. They are often the first to sense when something is wrong.',
  },
  {
    letter: 'S',
    title: 'Sensitivity to subtleties',
    body: 'A change in tone, a flickering light, a scratchy tag, a shift in someone\u2019s mood. The sensitive system registers fine details that most people filter out entirely.',
  },
]

const myths = [
  {
    myth: 'Sensitivity is a weakness to outgrow.',
    truth: 'It is an inherited, measurable trait that stays for life. The goal is understanding, not correction.',
  },
  {
    myth: 'Sensitive kids are just being dramatic.',
    truth: 'Their nervous system genuinely registers and processes more. The intensity is real, not performed.',
  },
  {
    myth: 'They will be fragile and struggle in life.',
    truth: 'With understanding and the right support, sensitive people are among the most creative, empathic, and conscientious.',
  },
  {
    myth: 'Sensitivity is the same as anxiety or a disorder.',
    truth: 'Sensitivity is a normal temperament trait. It can coexist with anxiety, but it is not a diagnosis.',
  },
]

export default function WhatIsSensitivityPage() {
  return (
    <>
      <PageHero
        label="The science"
        title="What is high sensitivity?"
        intro="High sensitivity, formally called Sensory Processing Sensitivity, is an inherited temperament trait found in 15 to 20 percent of people, and in over 100 other species. It is not a disorder, a phase, or a flaw. It is a different way of taking in the world."
      />

      {/* DOES framework */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <SectionLabel>The DOES framework</SectionLabel>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Four traits that define a sensitive nervous system.
          </h2>
          <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-charcoal/85">
            Dr. Elaine Aron, the researcher who first identified the trait, describes sensitivity
            through four hallmarks she calls DOES.
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

      {/* Myths vs truth */}
      <section className="border-y border-stone bg-paper">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 md:py-24">
          <SectionLabel>Myths and truths</SectionLabel>
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            What sensitivity is, and is not.
          </h2>
          <div className="mt-12 space-y-4">
            {myths.map((m) => (
              <div
                key={m.myth}
                className="grid gap-4 rounded-xl border border-stone bg-card p-6 sm:grid-cols-2 sm:gap-8"
              >
                <div>
                  <span className="font-sans text-xs font-semibold uppercase tracking-wider text-amber">
                    Myth
                  </span>
                  <p className="mt-2 font-serif text-[17px] leading-relaxed text-charcoal/70 line-through decoration-amber/50">
                    {m.myth}
                  </p>
                </div>
                <div>
                  <span className="font-sans text-xs font-semibold uppercase tracking-wider text-teal-mid">
                    Truth
                  </span>
                  <p className="mt-2 font-serif text-[17px] leading-relaxed text-charcoal/85">
                    {m.truth}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research foundations */}
      <section className="bg-deep-teal text-off-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <p className="section-label !text-sage-light">The research behind our work</p>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            Five fields of science, one curriculum.
          </h2>
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
