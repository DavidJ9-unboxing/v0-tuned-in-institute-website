import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/site/page-hero'
import { SectionLabel } from '@/components/site/section-label'

export const metadata: Metadata = {
  title: 'About',
  description:
    'The Tuned In Institute is the research and education arm of Rooted Rhythm, led by Sophie Schauermann, MSW, LCSW, Founder and CEO.',
}

const whatWeAre = [
  'A research and education organization grounded in attachment science, polyvagal theory, and Dr. Elaine Aron\u2019s work on Sensory Processing Sensitivity.',
  'A publisher of long-form books, course curricula, downloadable resources, and an AI concierge trained on the full body of work.',
  'A sibling to Rooted Rhythm Therapy, which provides clinical care in Dallas, Atlanta, and Colorado, and virtual coaching worldwide.',
  'A future home for primary research on high sensitivity across the lifespan.',
]

const whatWeAreNot = [
  'Not a diagnostic service, a therapy practice, or a substitute for clinical care.',
  'Not a generic wellness brand or a self-help imprint.',
  'Not a parenting influencer brand. There are clinical credentials and clinical hours behind every claim.',
  'Not a tech company. The AI concierge is a delivery vehicle for the curriculum, not the product.',
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="About"
        title="The research, education, and support home for sensitive humans."
        intro="The Tuned In Institute makes the science of high sensitivity practical, accessible, and lifelong, so sensitive children, teens, and adults grow up understood, regulated, and free of the belief that they are too much."
      />

      {/* Founder */}
      <section className="bg-off-white">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-20 sm:px-8 md:grid-cols-[0.8fr_1.2fr]">
          <figure className="overflow-hidden rounded-xl border border-stone shadow-[0_24px_50px_-30px_rgba(27,80,90,0.6)]">
            <Image
              src="/team/sophie.png"
              alt="Sophie Schauermann, MSW, LCSW, Founder and CEO, smiling with arms crossed"
              width={900}
              height={900}
              className="aspect-[4/5] h-auto w-full object-cover object-top"
              priority
            />
          </figure>
          <div>
            <SectionLabel>Leadership</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
              Sophie Schauermann, MSW, LCSW
            </h2>
            <p className="mt-2 font-sans text-sm font-medium uppercase tracking-[0.12em] text-teal-mid">
              Founder &amp; CEO, Rooted Rhythm and The Tuned In Institute
            </p>
            <p className="mt-6 font-serif text-lg leading-relaxed text-charcoal/85">
              Sophie Schauermann is a licensed clinical social worker with twelve years of practice
              sitting alongside sensitive children, teens, adults, and the families around them. She
              is the author of <em>Tuned In: A Guide for Parents of Sensitive Children</em> and the
              Founder and CEO of Rooted Rhythm, the clinical practice behind this Institute.
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-charcoal/85">
              Across more than a decade of clinical work, she watched the same pattern repeat:
              parents who felt confused and defeated, children who were treated as a problem to
              manage, and a body of research that never reached the kitchen table. The Institute
              exists to close that gap, turning the science of high sensitivity into tools a family
              can use tonight.
            </p>
          </div>
        </div>
      </section>

      {/* Chief Medical Officer */}
      <section className="border-t border-stone bg-off-white">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="md:order-1 md:row-start-1">
            <SectionLabel>Leadership</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
              Joel Schauermann, MD
            </h2>
            <p className="mt-2 font-sans text-sm font-medium uppercase tracking-[0.12em] text-teal-mid">
              Chief Medical Officer, Rooted Rhythm and The Tuned In Institute
            </p>
            <p className="mt-6 font-serif text-lg leading-relaxed text-charcoal/85">
              Joel Schauermann is a board-certified physician who brings the rigor of clinical
              medicine to the Institute&apos;s work on high sensitivity. As Chief Medical Officer, he
              ensures that everything we teach is grounded in current research and sound medical
              practice.
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-charcoal/85">
              He partners closely with our clinical team to bridge the gap between the science of the
              sensitive nervous system and the day-to-day care of the children, teens, and adults we
              serve, keeping our education both accurate and genuinely useful.
            </p>
          </div>
          <figure className="overflow-hidden rounded-xl border border-stone shadow-[0_24px_50px_-30px_rgba(27,80,90,0.6)] md:order-2 md:row-start-1">
            <Image
              src="/team/joel.png"
              alt="Joel Schauermann, MD, Chief Medical Officer, smiling in a white shirt"
              width={900}
              height={900}
              className="aspect-[4/5] h-auto w-full object-cover object-top"
            />
          </figure>
        </div>
      </section>

      {/* Mission, vision, promise */}
      <section className="border-y border-stone bg-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-3">
          {[
            {
              label: 'Mission',
              body: 'To make the science of high sensitivity practical, accessible, and lifelong, so sensitive humans grow up understood, regulated, and free of the belief that they are too much.',
            },
            {
              label: 'Vision',
              body: 'A world in which sensitivity is recognized as a strength, taught as a skill, and supported across every stage of life.',
            },
            {
              label: 'Promise',
              body: 'You walk away with two things: a more accurate map of what is happening inside a sensitive nervous system, and the next concrete step you can take tonight.',
            },
          ].map((item) => (
            <div key={item.label}>
              <SectionLabel>{item.label}</SectionLabel>
              <p className="mt-5 font-serif text-lg leading-relaxed text-charcoal/85">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What we are / are not */}
      <section className="bg-off-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2">
          <div>
            <SectionLabel>What we are</SectionLabel>
            <ul className="mt-6 space-y-4">
              {whatWeAre.map((item) => (
                <li key={item} className="flex gap-3 font-serif text-[17px] leading-relaxed text-charcoal/85">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionLabel>What we are not</SectionLabel>
            <ul className="mt-6 space-y-4">
              {whatWeAreNot.map((item) => (
                <li key={item} className="flex gap-3 font-serif text-[17px] leading-relaxed text-charcoal/85">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Core belief */}
      <section className="bg-deep-teal text-off-white">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <p className="section-label section-label-center !text-sage-light">Core belief</p>
          <blockquote className="mt-8 font-serif text-3xl font-medium italic leading-snug text-balance sm:text-4xl">
            &ldquo;Sensitivity is not a flaw. It is a different operating system. The work is to
            understand it, not to fix it.&rdquo;
          </blockquote>
          <Button
            asChild
            size="lg"
            className="mt-10 bg-off-white font-sans font-semibold text-deep-teal hover:bg-off-white/90"
          >
            <Link href="/request-access">Request Access</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
