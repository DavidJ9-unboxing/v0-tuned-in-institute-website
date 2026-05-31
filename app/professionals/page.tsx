import type { Metadata } from 'next'
import Link from 'next/link'
import { Stethoscope, GraduationCap, Users, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/site/page-hero'
import { SectionLabel } from '@/components/site/section-label'

export const metadata: Metadata = {
  title: 'For Professionals',
  description:
    'Resources and partnership for therapists, educators, and pediatric providers who work with sensitive children, teens, and adults.',
}

const audiences = [
  {
    icon: Stethoscope,
    title: 'Therapists & clinicians',
    body: 'Use our curriculum as structured psychoeducation between sessions, and refer families to a shared language for sensitivity.',
  },
  {
    icon: GraduationCap,
    title: 'Educators & schools',
    body: 'Understand the sensitive students in your classroom and adapt the environment to reduce overstimulation and shame.',
  },
  {
    icon: Users,
    title: 'Pediatric providers',
    body: 'Recognize high sensitivity as a temperament trait, distinguish it from disorder, and point families toward real support.',
  },
  {
    icon: BookMarked,
    title: 'Coaches & group leaders',
    body: 'License module content for parent groups, workshops, and community programs grounded in the research.',
  },
]

const partnership = [
  'Evidence-based curriculum built on SPS, polyvagal, and attachment research',
  'A shared, non-pathologizing language to use with families',
  'Referral pathway to Rooted Rhythm Therapy in Dallas, Atlanta, and Colorado',
  'Group and organizational licensing for the full library',
]

export default function ProfessionalsPage() {
  return (
    <>
      <PageHero
        label="For professionals"
        title="A research foundation you can build your practice on."
        intro="The Tuned In Institute supports the clinicians, educators, and providers who sit with sensitive humans every day, with a shared language, structured curriculum, and a clinical referral pathway."
      />

      {/* Audiences */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <SectionLabel>Who we support</SectionLabel>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {audiences.map((a) => (
              <div key={a.title} className="flex gap-5 rounded-xl border border-stone bg-card p-7">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-sage-light text-deep-teal">
                  <a.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-deep-teal">{a.title}</h3>
                  <p className="mt-2 font-serif text-[15px] leading-relaxed text-charcoal/80">
                    {a.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership */}
      <section className="border-y border-stone bg-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2">
          <div>
            <SectionLabel>Partnership</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
              Bring Tuned In into your practice.
            </h2>
            <p className="mt-6 font-serif text-lg leading-relaxed text-charcoal/85">
              Whether you want to assign modules between sessions, license content for a group
              program, or build a referral relationship, we make it straightforward to put the
              science to work for the people you serve.
            </p>
          </div>
          <ul className="space-y-4">
            {partnership.map((p) => (
              <li
                key={p}
                className="flex gap-3 rounded-xl border border-stone bg-card px-6 py-5 font-serif text-[16px] leading-relaxed text-charcoal/85"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Rooted Rhythm */}
      <section className="bg-deep-teal text-off-white">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <p className="section-label section-label-center !text-sage-light">Clinical partner</p>
          <h2 className="mt-6 font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            Education here, clinical care at Rooted Rhythm.
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-off-white/85">
            For families who need direct support, we partner with Rooted Rhythm Therapy, a clinical
            practice specializing in sensitive children, teens, and adults across Dallas, Atlanta,
            and Colorado.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-off-white font-sans font-semibold text-deep-teal hover:bg-off-white/90"
            >
              <a href="https://www.rootedrhythm.com" target="_blank" rel="noopener noreferrer">
                Visit Rooted Rhythm Therapy
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-off-white/40 bg-transparent font-sans font-semibold text-off-white hover:bg-off-white hover:text-deep-teal"
            >
              <a href="mailto:hello@tunedinstitute.com">Partner with us</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
