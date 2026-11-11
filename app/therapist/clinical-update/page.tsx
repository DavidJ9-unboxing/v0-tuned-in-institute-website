import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CircleCheck } from 'lucide-react'
import { requireStaff } from '@/lib/session'
import { PrintButton } from '@/components/therapist/print-button'

export const metadata = {
  title: 'Clinical Update: January 2027 | Rooted Rhythm',
  robots: { index: false, follow: false },
}

const sessionOptions = [
  {
    label: 'Option 1',
    title: '40-minute child session + same-day parent check-in',
    timeline: [
      { minutes: '40 min', who: 'Child', note: 'Individual therapy' },
      { minutes: '10–15 min', who: 'Parent', note: 'Phone or video, same day' },
    ],
    points: [
      'Spend 40 minutes in individual therapy with the child.',
      'Schedule a separate 10–15 minute parent check-in by phone or video that same day.',
      'Make sure the child is appropriately supervised during the parent conversation.',
    ],
  },
  {
    label: 'Option 2',
    title: 'Full child session + separate parent coaching',
    timeline: [
      { minutes: '53 min', who: 'Child / teen', note: '90837' },
      { minutes: '25–26 min', who: 'Parent', note: 'Video, another day · 90846' },
    ],
    points: [
      'Spend a full 53 minutes in individual therapy with the child or teen (90837).',
      'Schedule a separate 25–26 minute parent coaching session by video on another day of the week (90846, when clinically appropriate and billing requirements are met).',
    ],
  },
  {
    label: 'Option 3',
    title: 'Child session with family integration + separate parent coaching',
    timeline: [
      { minutes: '~43 min', who: 'Child / teen', note: 'Individual' },
      { minutes: '10 min', who: 'Family', note: 'Parents join in session' },
      { minutes: '26 min', who: 'Parent', note: 'Video, another day' },
    ],
    points: [
      'Spend about 43 minutes individually with the child or teen.',
      'Invite parents or caregivers into the final 10 minutes to practice co-regulation, strengthen connection, and talk through relevant themes together.',
      'Schedule an additional 26-minute parent coaching session by video on another day of the week.',
    ],
  },
]

function SectionHeading({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-3 font-serif text-2xl font-semibold text-deep-teal">
      <span className="font-sans text-sm font-semibold tracking-[0.14em] text-sage-deep">
        {number}
      </span>
      <span className="text-balance">{children}</span>
    </h2>
  )
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CircleCheck className="mt-0.5 size-4 shrink-0 text-sage-deep" aria-hidden="true" />
      <span>{children}</span>
    </li>
  )
}

export default async function ClinicalUpdatePage() {
  const staff = await requireStaff()
  if (staff.mustChangePassword) redirect('/account/password?first=1')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          href="/therapist"
          className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-deep-teal hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to client onboarding
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-stone bg-card p-6 sm:p-10 print:border-0 print:p-0">
        <header className="flex flex-col gap-3 border-b border-stone pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-deep-teal px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground">
              Effective January 2027
            </span>
            <span className="rounded-full border border-stone px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-sage-deep">
              Clinician only · Not for clients
            </span>
          </div>
          <h1 className="text-balance font-serif text-3xl font-semibold leading-tight text-deep-teal sm:text-4xl">
            Important Clinical Update
          </h1>
          <p className="font-serif text-lg italic text-charcoal/80">
            Child &amp; teen therapy, parent coaching, and the Tuned In process
          </p>
          <p className="font-sans leading-relaxed text-muted-foreground">
            As we keep learning from our families, therapists, and clinical supervisors, we&apos;re
            making some important updates to our therapy model starting January 2027. These
            changes reflect our commitment to trauma-informed, developmentally appropriate care,
            and to making sure both children and parents feel fully supported throughout the
            therapeutic process.
          </p>
        </header>

        {/* 1. Session structure */}
        <section className="flex flex-col gap-4 border-b border-stone py-8 print:break-inside-avoid-page">
          <SectionHeading number="01">Updated session structure &amp; parent coaching</SectionHeading>
          <p className="font-sans text-sm leading-relaxed text-charcoal">
            For many years, children waited while therapists met with parents for the last 10–15
            minutes of a session. We&apos;re moving away from this practice. Leaving children
            unattended isn&apos;t clinically appropriate, especially through a trauma-informed lens,
            and every child should stay appropriately supervised.
          </p>
          <p className="font-sans text-sm font-semibold text-deep-teal">
            Moving forward, we recommend three options:
          </p>

          <div className="flex flex-col gap-4">
            {sessionOptions.map((opt) => (
              <div
                key={opt.label}
                className="flex flex-col gap-3 rounded-xl border border-stone bg-background p-5 print:break-inside-avoid print:bg-transparent"
              >
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-sage-deep">
                    {opt.label}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-charcoal">{opt.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2" aria-label={`${opt.label} time breakdown`}>
                  {opt.timeline.map((t) => (
                    <div
                      key={t.who + t.minutes}
                      className="flex flex-col rounded-lg bg-secondary/60 px-3 py-2"
                    >
                      <span className="font-serif text-base font-semibold text-deep-teal">
                        {t.minutes}
                      </span>
                      <span className="font-sans text-xs text-charcoal">
                        <span className="font-semibold">{t.who}</span> · {t.note}
                      </span>
                    </div>
                  ))}
                </div>
                <ul className="flex flex-col gap-2 font-sans text-sm leading-relaxed text-charcoal">
                  {opt.points.map((p) => (
                    <Check key={p}>{p}</Check>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="font-sans text-sm leading-relaxed text-charcoal">
            The goal is to give children the therapeutic space they need while giving parents
            meaningful, consistent support.
          </p>
          <p className="rounded-lg bg-secondary/60 px-4 py-3 font-sans text-sm leading-relaxed text-deep-teal">
            Work with your supervisor and our clinical leadership team to choose the right structure
            for each family, and make sure documentation and billing match the services provided.
          </p>
        </section>

        {/* 2. Tuned In modules */}
        <section className="flex flex-col gap-4 border-b border-stone py-8 print:break-inside-avoid-page">
          <SectionHeading number="02">Supporting parents through the Tuned In modules</SectionHeading>
          <p className="font-sans text-sm leading-relaxed text-charcoal">
            Many families choose Rooted Rhythm specifically because they want both therapy for their
            child and real parent coaching through the Tuned In process. Parents are often looking
            for structure, accountability, and support as they put what they&apos;re learning into
            practice.
          </p>
          <div className="flex flex-col gap-2 rounded-xl border border-stone bg-background p-5 print:bg-transparent">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-sage-deep">
              In parent coaching, ask
            </p>
            <ul className="flex flex-col gap-2 font-serif text-base italic leading-relaxed text-charcoal">
              <li>&ldquo;What are you learning in the Tuned In modules?&rdquo;</li>
              <li>&ldquo;What are you practicing at home?&rdquo;</li>
              <li>&ldquo;Where are you feeling stuck?&rdquo;</li>
            </ul>
          </div>
          <p className="font-sans text-sm leading-relaxed text-charcoal">
            <span className="font-semibold text-deep-teal">
              Don&apos;t be afraid to hold parents accountable in a supportive way.
            </span>{' '}
            Many are asking for exactly this. They want to be guided through the process and
            supported in following through on their commitments.
          </p>
          <p className="font-sans text-sm leading-relaxed text-charcoal">
            The goal isn&apos;t only to update parents on how their child is doing in therapy, but
            to help parents grow alongside their children.
          </p>
        </section>

        {/* 3. Directive / non-directive */}
        <section className="flex flex-col gap-4 border-b border-stone py-8 print:break-inside-avoid-page">
          <SectionHeading number="03">Balancing non-directive and directive therapy</SectionHeading>
          <p className="font-sans text-sm leading-relaxed text-charcoal">
            More and more, families, children, and teens are telling us they want therapists to be
            more directive when appropriate. This comes up especially often with gifted children and
            teens who want to understand what they&apos;re working toward, but it isn&apos;t limited
            to that group. Some have told us directly that they want their therapist to ask
            questions, help identify goals, offer guidance, and be clear about what they&apos;re
            working on together.
          </p>
          <p className="font-sans text-sm leading-relaxed text-charcoal">
            We deeply value child-centered, non-directive play therapy, and the healing that happens
            when children feel seen, felt, and understood without pressure to perform or change.
          </p>
          <blockquote className="border-l-4 border-sage-deep py-1 pl-4 font-serif text-xl font-semibold leading-snug text-deep-teal">
            Being a wonderful child-centered therapist does not mean you can never be directive.
          </blockquote>
          <div className="flex flex-col gap-2">
            <p className="font-sans text-sm font-semibold text-charcoal">
              Trust your clinical judgment and authenticity. When appropriate:
            </p>
            <ul className="flex flex-col gap-2 font-sans text-sm leading-relaxed text-charcoal">
              <Check>Ask questions</Check>
              <Check>Introduce interventions</Check>
              <Check>Identify goals together</Check>
              <Check>Help children and teens understand their therapeutic process</Check>
            </ul>
          </div>
          <p className="font-sans text-sm leading-relaxed text-charcoal">
            We want to stay grounded in our child-centered philosophy while responding to what each
            child or teen tells us they need. If you&apos;re unsure how to bring in more directive
            interventions, seek supervision, explore additional clinical resources, and work with
            your supervisor to build those skills. We want you to feel confident working across
            both approaches, not limited to one.
          </p>
        </section>

        {/* 4. Existing materials */}
        <section className="flex flex-col gap-4 py-8 print:break-inside-avoid-page">
          <SectionHeading number="04">A note about existing training videos &amp; materials</SectionHeading>
          <p className="font-sans text-sm leading-relaxed text-charcoal">
            As you work through the Tuned In modules, our 12-session therapy process, and the
            training materials on session structure and billing codes, keep in mind that our model
            keeps evolving. Some of these updates came after the original videos and materials were
            recorded.
          </p>
          <p className="rounded-lg bg-deep-teal px-4 py-3 font-sans text-sm font-medium leading-relaxed text-primary-foreground">
            The January 2027 guidance here is our most current clinical expectation. Where it
            differs from older training materials, follow this guidance.
          </p>
        </section>

        <footer className="border-t border-stone pt-6">
          <p className="font-serif text-base italic leading-relaxed text-charcoal/80">
            Thank you for growing alongside us, staying open to feedback, and bringing your own
            clinical wisdom and authenticity into this work. Our goal is always a therapeutic
            experience where children, teens, and parents all feel deeply supported.
          </p>
          <p className="mt-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-sage-deep">
            Rooted Rhythm Clinical Leadership · Tuned In Institute
          </p>
        </footer>
      </article>
    </div>
  )
}
