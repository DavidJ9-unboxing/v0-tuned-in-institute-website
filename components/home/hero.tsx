'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, GraduationCap, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { useRemi } from '@/components/library/remi-launcher'
import { AccessCta, SignInCta } from '@/components/site/access-cta'

const accessPoints = [
  {
    label: 'Programs',
    href: '/programs',
    description: 'Structured courses for parents, teens, adults, and couples.',
    icon: GraduationCap,
  },
  {
    label: 'Resources',
    href: '/resources',
    description: 'The research library, guides, and member-only deep dives.',
    icon: BookOpen,
  },
  {
    label: 'Concierge',
    href: '/concierge',
    description: 'Personal guidance, trained on the Tuned In curriculum.',
    icon: MessageCircle,
  },
]

export function Hero() {
  const { data: session } = useSession()
  const { open: openRemi } = useRemi()
  const user = session?.user

  return (
    <section className="bg-deep-teal text-off-white">
      {/* Tagline band — sits in the gap between the header and the hero logo */}
      <div className="border-b border-off-white/15 bg-deep-teal/40">
        <p className="mx-auto max-w-6xl px-5 py-2.5 text-center font-serif text-sm italic leading-snug text-off-white/80 sm:px-8 sm:text-base">
          Research, education, and support for sensitive humans.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8 md:py-5">
        <div className="text-center">
          {/* Title block */}
          <div className="flex-1">
            <p className="mx-auto max-w-2xl font-sans text-lg leading-relaxed text-off-white/85">
              <span className="font-semibold text-off-white">The Tuned In Institute</span> is the
              research and education arm of{' '}
              <span className="whitespace-nowrap font-semibold text-off-white">Rooted Rhythm Therapy</span>. This is
              where you can access our research and self-help tools, plus{' '}
              <span className="font-semibold text-off-white">Remi</span>, your AI concierge who helps
              you navigate the content and get real answers to your real questions.
            </p>

            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <SignInCta
                  label="Sign In to the Library"
                  variant="default"
                  className="h-12 w-full px-8 text-base font-semibold bg-sage font-sans text-deep-teal shadow-sm transition-shadow hover:bg-sage/90 hover:shadow-md sm:w-auto"
                />
                <AccessCta
                  libraryLabel="Go to the Library"
                  variant="outline"
                  className="h-12 w-full border-2 border-off-white/50 bg-transparent px-8 text-base font-semibold text-off-white font-sans transition-colors hover:bg-off-white hover:text-deep-teal sm:w-auto"
                  libraryVariant="default"
                  libraryClassName="h-12 w-full px-8 text-base font-semibold bg-sage font-sans text-deep-teal shadow-sm transition-shadow hover:bg-sage/90 hover:shadow-md sm:w-52"
                />
                {user && (
                  <Button
                    type="button"
                    onClick={() => openRemi()}
                    size="lg"
                    variant="outline"
                    className="h-12 w-full gap-2 border-2 border-off-white/50 bg-transparent px-8 text-base font-semibold text-off-white font-sans transition-colors hover:bg-off-white hover:text-deep-teal sm:w-52"
                  >
                    <Sparkles className="size-4" aria-hidden="true" />
                    Ask Remi
                  </Button>
                )}
              </div>
              {!user && (
                <span className="w-full text-center font-sans text-xs text-off-white/60">
                  Full access requires membership
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clear access points */}
      <div className="border-t border-off-white/15">
        <div className="mx-auto grid max-w-6xl gap-px bg-off-white/15 px-5 sm:px-8 md:grid-cols-3">
          {accessPoints.map(({ label, href, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-2 bg-deep-teal px-6 py-6 transition-colors hover:bg-deep-teal/70"
            >
              <span className="flex items-center gap-2.5 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-sage">
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </span>
              <span className="font-serif text-[15px] leading-relaxed text-off-white/75">
                {description}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 font-sans text-xs font-medium text-off-white/90 transition-transform group-hover:translate-x-0.5">
                Explore <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
