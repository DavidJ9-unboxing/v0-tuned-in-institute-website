import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { FeaturedLesson } from '@/lib/content'

// Human-readable label for each lesson kind, used on the featured cards.
const kindLabel: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  link: 'Resource',
  document: 'Document',
}

/**
 * Renders the admin-curated featured content as a card grid. Shared by the
 * home page and the resources page. Members deep-link straight into the exact
 * lesson; guests are routed to sign in since the library is gated.
 */
export function FeaturedGrid({
  items,
  isMember,
}: {
  items: FeaturedLesson[]
  isMember: boolean
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((f) => {
        const href = isMember ? `/library/${f.sectionSlug}?lesson=${f.id}` : '/sign-in'
        return (
          <Link
            key={f.id}
            href={href}
            className="group flex flex-col rounded-xl border border-stone bg-card p-7 transition-all hover:border-deep-teal/40 hover:shadow-[0_12px_32px_-20px_rgba(27,80,90,0.45)]"
          >
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-deep">
              {kindLabel[f.kind] ?? 'Resource'}
            </span>
            <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-deep-teal">
              {f.headline || f.title}
            </h3>
            {(f.blurb || f.description) && (
              <p className="mt-3 flex-1 font-serif text-[15px] leading-relaxed text-charcoal/80">
                {f.blurb || f.description}
              </p>
            )}
            <span className="mt-5 inline-flex items-center gap-1 font-sans text-sm font-semibold text-deep-teal">
              {isMember ? 'Open' : 'Members only — sign in'}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        )
      })}
    </div>
  )
}
