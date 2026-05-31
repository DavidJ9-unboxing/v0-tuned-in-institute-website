import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, GraduationCap, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  return (
    <section className="bg-deep-teal text-off-white">
      {/* Tagline band — sits in the gap between the header and the hero logo */}
      <div className="border-b border-off-white/15 bg-deep-teal/40">
        <p className="mx-auto max-w-6xl px-5 py-2.5 text-center font-serif text-sm italic leading-snug text-off-white/80 sm:px-8 sm:text-base">
          Research, education, and support for sensitive humans.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-14">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-center md:gap-10 md:text-left">
          {/* Logo mark */}
          <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-off-white sm:size-32">
            <Image
              src="/logos/tii-logo-mark.png"
              alt=""
              width={160}
              height={160}
              priority
              className="size-28 scale-[1.4] object-contain sm:size-32"
            />
          </div>

          {/* Title block */}
          <div className="flex-1">
            <p className="mx-auto max-w-2xl font-sans text-lg leading-relaxed text-off-white/85 md:mx-0">
              Get all our research and self-help tools, plus{' '}
              <span className="font-semibold text-off-white">Remi</span>, your AI concierge who helps
              you navigate the content and get real answers to your real questions. The Institute is
              the research and education arm of{' '}
              <span className="font-semibold text-off-white">Rooted Rhythm</span>, led by{' '}
              <span className="font-semibold text-off-white">Sophie Schauermann, MSW, LCSW</span>.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-sage font-sans font-semibold text-deep-teal hover:bg-sage/90"
              >
                <Link href="/sign-in">Sign In to the Library</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-off-white/40 bg-transparent font-sans font-semibold text-off-white hover:bg-off-white hover:text-deep-teal"
              >
                <Link href="/request-access">Request Access</Link>
              </Button>
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
