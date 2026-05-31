import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, BrainCircuit, Baby, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/site/page-hero'
import { SectionLabel } from '@/components/site/section-label'
import { ConciergeExchange, conciergeExamples } from '@/components/site/concierge-exchange'

export const metadata: Metadata = {
  title: 'AI Concierge',
  description:
    'A 24/7 AI concierge trained on the full Tuned In curriculum, giving sensitive families personalized, research-grounded answers in the moment. Coming soon.',
}

const features = [
  {
    icon: Clock,
    title: 'Available at 11pm',
    body: 'The hardest parenting moments rarely happen during office hours. The concierge is there whenever you need it.',
  },
  {
    icon: BrainCircuit,
    title: 'Trained on the curriculum',
    body: 'Every answer is grounded in the same research and modules behind our programs, not generic internet advice.',
  },
  {
    icon: Baby,
    title: 'Personalized to age and stage',
    body: 'Responses adapt to whether you are asking about a toddler, a teen, or yourself as a sensitive adult.',
  },
  {
    icon: ShieldCheck,
    title: 'Clear about its limits',
    body: 'It is education and support, not therapy or diagnosis, and it will always tell you when to seek clinical care.',
  },
]

export default function ConciergePage() {
  return (
    <>
      <PageHero
        label="Coming soon"
        title="A concierge that knows the science, available 24/7."
        intro="Imagine having a knowledgeable, calm guide in your pocket, trained on every module and resource in the Tuned In curriculum, ready the moment a sensitive child melts down or a sensitive adult hits a wall."
      />

      {/* Live examples */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <SectionLabel>What it sounds like</SectionLabel>
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Real questions. Grounded, in-the-moment answers.
          </h2>
          <div className="mt-12 space-y-6">
            {conciergeExamples.map((ex) => (
              <ConciergeExchange key={ex.question} question={ex.question} answer={ex.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-stone bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <SectionLabel>Why it works</SectionLabel>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="flex gap-5 rounded-xl border border-stone bg-card p-7">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-sage-light text-deep-teal">
                  <f.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-deep-teal">{f.title}</h3>
                  <p className="mt-2 font-serif text-[15px] leading-relaxed text-charcoal/80">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early access CTA */}
      <section className="bg-deep-teal text-off-white">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 md:py-24">
          <p className="section-label section-label-center !text-sage-light">Be first in line</p>
          <h2 className="mt-6 font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            The concierge launches to clients first.
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-off-white/85">
            Rooted Rhythm clients with library access will be among the first to use the concierge
            the day it goes live, at no extra cost.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-off-white font-sans font-semibold text-deep-teal hover:bg-off-white/90"
            >
              <Link href="/request-access">Request Access</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-off-white/40 bg-transparent font-sans font-semibold text-off-white hover:bg-off-white hover:text-deep-teal"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
