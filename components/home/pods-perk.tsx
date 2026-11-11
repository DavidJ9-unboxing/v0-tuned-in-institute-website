import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/site/section-label'
import { POD_NAME } from '@/lib/groups'

const podTypes = [
  {
    title: 'Parent pods',
    body: 'For parents of sensitive children and teens. Connect with other parents on the Tuned In material and get feedback on supporting your child while they are in therapy.',
  },
  {
    title: 'Adult self-care pods',
    body: 'For adults on their own Tuned In journey. A steady weekly space for self-care, connection, and putting regulation tools into practice.',
  },
]

const details = [
  '30 to 45 minutes, once a week',
  'Small groups of at least 4',
  'Led by our founder, Sophie, and parent coaches',
]

export function PodsPerk({ isMember }: { isMember: boolean }) {
  return (
    <section id="pods" className="scroll-mt-24 border-y border-stone bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-16">
        <div className="grid gap-12 md:grid-cols-5 md:gap-16">
          <div className="flex flex-col md:col-span-2">
            <SectionLabel>A membership perk</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
              {POD_NAME}
            </h2>
            <p className="mt-5 font-serif text-lg leading-relaxed text-charcoal/85 text-pretty">
              Learning is easier together. Members can join a small weekly group that supports
              their Tuned In learning journey.
            </p>
            <p className="mt-5 rounded-lg border border-stone bg-off-white px-4 py-3 font-sans text-sm leading-relaxed text-charcoal/80">
              <strong className="font-semibold text-deep-teal">These are not therapy groups.</strong>{' '}
              They are learning and connection groups that work alongside your Tuned In courses
              and books.
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {details.map((d) => (
                <li key={d} className="flex items-center gap-3 font-sans text-sm text-charcoal/80">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5 md:col-span-3">
            {podTypes.map((p) => (
              <div key={p.title} className="rounded-xl border border-stone bg-off-white p-6">
                <span className="block h-1 w-8 bg-sage" aria-hidden="true" />
                <h3 className="mt-4 font-serif text-xl font-semibold text-deep-teal">{p.title}</h3>
                <p className="mt-2 font-serif text-[15px] leading-relaxed text-charcoal/80">
                  {p.body}
                </p>
              </div>
            ))}

            <div className="flex flex-col gap-4 rounded-xl bg-deep-teal p-6 text-off-white sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md font-serif text-[15px] leading-relaxed text-off-white/90">
                {isMember
                  ? 'Sign up in the Institute and tell us your goals. We will reach out when a pod forms.'
                  : 'Members sign up inside the Institute. You can also email '}
                {!isMember && (
                  <>
                    <a
                      href="mailto:pod@rootedrhythm.com"
                      className="font-semibold underline underline-offset-2"
                    >
                      pod@rootedrhythm.com
                    </a>{' '}
                    with your interest and goals.
                  </>
                )}
              </p>
              <Button
                asChild
                size="lg"
                className="shrink-0 bg-off-white font-sans font-semibold text-deep-teal hover:bg-off-white/90"
              >
                <Link href={isMember ? '/library#groups' : '/sign-in'}>
                  {isMember ? 'Sign up for a pod' : 'Sign in to sign up'}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
