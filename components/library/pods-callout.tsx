import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { POD_NAME } from '@/lib/groups'

export function PodsCallout({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label={POD_NAME}
      className={`flex flex-col gap-4 rounded-2xl border border-stone bg-secondary px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 ${className}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">
          <Users className="size-4" aria-hidden="true" />
          {POD_NAME}
        </div>
        <p className="max-w-2xl font-serif text-[15px] leading-relaxed text-charcoal/85">
          <strong className="font-semibold text-deep-teal">Not therapy groups.</strong> Small weekly
          learning and connection groups (30 to 45 minutes, at least 4 people) that support your
          Tuned In learning journey. We offer parent pods and adult self-care pods. Sign up here or
          email{' '}
          <a
            href="mailto:pod@rootedrhythm.com"
            className="font-semibold text-deep-teal underline underline-offset-2"
          >
            pod@rootedrhythm.com
          </a>{' '}
          with your interest and goals.
        </p>
      </div>
      <Link
        href="/library#groups"
        className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg bg-deep-teal px-4 py-2.5 font-sans text-sm font-semibold text-off-white hover:bg-deep-teal/90"
      >
        Sign up for a pod
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  )
}
