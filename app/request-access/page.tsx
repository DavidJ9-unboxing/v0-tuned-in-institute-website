import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Lock } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { SectionLabel } from '@/components/site/section-label'
import { RequestAccessForm } from '@/components/site/request-access-form'

export const metadata: Metadata = {
  title: 'Request Access',
  description:
    'The Tuned In Institute content library is available to Rooted Rhythm clients. Request access and our team will be in touch.',
}

const included = [
  'All four program tracks: Parenting, Parenting for Teens, Sensitive Teens, and Adults',
  'Every video lesson, with audio versions and full transcripts',
  'The complete library of worksheets, scripts, and quick guides',
  'New programs and resources as they are released',
  'Early access to the 24/7 AI concierge when it launches',
]

export default function RequestAccessPage() {
  return (
    <>
      <PageHero
        label="Access"
        title="Request access to the library"
        intro="The Tuned In Institute content library is created by the licensed therapists at Rooted Rhythm and reserved for their clients. Tell us a little about you and our team will be in touch."
      />

      <section className="bg-off-white">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 md:grid-cols-[1fr_1fr] md:py-24">
          {/* Left: what you get + how it works */}
          <div>
            <div className="flex items-start gap-3 rounded-xl border border-deep-teal/20 bg-sage-light px-5 py-4">
              <Lock className="mt-0.5 size-5 shrink-0 text-deep-teal" aria-hidden="true" />
              <p className="font-serif text-[15px] leading-relaxed text-charcoal/85">
                This content is available only to{' '}
                <span className="font-semibold text-deep-teal">Rooted Rhythm clients</span>. Already
                a client?{' '}
                <Link href="/sign-in" className="font-semibold text-deep-teal underline">
                  Sign in here
                </Link>
                .
              </p>
            </div>

            <SectionLabel className="mt-10">What access includes</SectionLabel>
            <ul className="mt-6 space-y-3">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 font-serif text-[16px] leading-relaxed text-charcoal/85"
                >
                  <Check className="mt-1 size-5 shrink-0 text-sage-deep" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <SectionLabel className="mt-10">How it works</SectionLabel>
            <ol className="mt-6 space-y-4">
              {[
                'Send your request using the form.',
                'Our team verifies your relationship with Rooted Rhythm.',
                'Once verified, you receive sign-in details for the full library.',
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-deep-teal font-sans text-sm font-semibold text-off-white">
                    {i + 1}
                  </span>
                  <span className="font-serif text-[16px] leading-relaxed text-charcoal/85">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-stone bg-card p-7 sm:p-9">
            <h2 className="font-serif text-2xl font-semibold text-deep-teal">Send your request</h2>
            <p className="mt-2 font-serif text-[15px] leading-relaxed text-charcoal/70">
              Goes directly to admin@tunedininstitute.org.
            </p>
            <div className="mt-7">
              <RequestAccessForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
