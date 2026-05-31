import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, BrainCircuit, Baby, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/site/page-hero'
import { SectionLabel } from '@/components/site/section-label'
import { ConciergeExchange, conciergeExamples } from '@/components/site/concierge-exchange'
import { AskRemiButton } from '@/components/library/remi-launcher'

export const metadata: Metadata = {
  title: 'Meet Remi, your AI Concierge',
  description:
    'Remi is a 24/7 AI concierge trained on the full Tuned In Institute and Rooted Rhythm libraries, giving sensitive families personalized, research-grounded answers in the moment. Live now for members.',
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

const howItWorks = [
  {
    title: 'Ask in plain language',
    body: 'Open Remi from anywhere on the site and describe what is happening, the same way you would text a trusted friend.',
  },
  {
    title: 'She searches the library',
    body: 'Remi draws only on Tuned In Institute and Rooted Rhythm resources to ground her answer, then links you to the exact modules and articles she used.',
  },
  {
    title: 'You get a calm next step',
    body: 'You receive a warm, practical response in the moment, and a clear nudge toward a Rooted Rhythm therapist whenever real clinical care is the better fit.',
  },
]

export default function ConciergePage() {
  return (
    <>
      <PageHero
        label="Now live for members"
        title="Meet Remi, a concierge that knows the science, available 24/7."
        intro="Remi is a knowledgeable, calm guide in your pocket, trained on every module and resource across the Tuned In Institute and Rooted Rhythm. She is ready the moment a sensitive child melts down or a sensitive adult hits a wall."
      >
        <AskRemiButton label="Talk to Remi now" />
      </PageHero>

      {/* Meet Remi — name meaning */}
      <section className="border-b border-stone bg-sage-light">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
          <SectionLabel center>Meet Remi</SectionLabel>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-charcoal/85 text-pretty">
            Remi is your Tuned In AI Concierge, here to help you quickly find answers, resources, and
            support whenever you need it. Derived from a French name meaning &ldquo;oarsman&rdquo; or
            &ldquo;guide,&rdquo; Remi embodies our belief that no one should have to navigate growth,
            healing, or life&apos;s challenges alone. Whether you&apos;re a parent, teen, adult, or
            sensitive soul seeking deeper understanding, Remi is here to help guide the way.
          </p>
        </div>
      </section>

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
          <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-deep-teal/20 bg-sage-light px-6 py-8 text-center">
            <p className="font-serif text-lg leading-relaxed text-charcoal/85 text-pretty">
              Remi is live for members right now. Ask her anything, anytime.
            </p>
            <AskRemiButton label="Talk to Remi now" />
          </div>
        </div>
      </section>

      {/* How Remi works */}
      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Three simple steps, any time of day.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="rounded-xl border border-stone bg-card p-7">
                <span className="flex size-9 items-center justify-center rounded-full bg-deep-teal font-sans text-sm font-semibold text-off-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-serif text-xl font-semibold text-deep-teal">
                  {step.title}
                </h3>
                <p className="mt-2 font-serif text-[15px] leading-relaxed text-charcoal/80">
                  {step.body}
                </p>
              </div>
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
          <p className="section-label section-label-center !text-sage-light">Start a conversation</p>
          <h2 className="mt-6 font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            Remi is ready whenever you are.
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-off-white/85">
            Members get Remi included with library access, at no extra cost. Sign in to start
            chatting, or request access to join.
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
