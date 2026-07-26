import Link from 'next/link'
import { ArrowRight, Layers, PlayCircle } from 'lucide-react'
import type { SectionWithCount } from '@/lib/content'

export function SectionCard({
  section,
  displayTitle,
  countNoun,
  showBadge = true,
}: {
  section: SectionWithCount
  /** Optional override for the shown title (e.g. a shortened label inside a collection). */
  displayTitle?: string
  /** Force the item-count noun (e.g. "lesson" for modules shown inside a course). */
  countNoun?: 'lesson' | 'resource'
  /** Whether the "Course" badge may show. Suppressed for cards inside a collection. */
  showBadge?: boolean
}) {
  // Course sections show a "Course" badge and count items as "lessons";
  // everything else counts its items as "resources".
  const noun = countNoun ?? (section.isCourse ? 'lesson' : 'resource')
  return (
    <Link
      href={`/library/${section.slug}`}
      className="group flex flex-col justify-between gap-6 rounded-2xl border border-stone bg-card p-6 transition-all hover:border-deep-teal/40 hover:shadow-[0_12px_32px_-20px_rgba(27,80,90,0.45)]"
    >
      <div className="flex flex-col gap-3">
        {showBadge && section.isCourse && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-light px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-deep-teal">
            <Layers className="size-3.5" aria-hidden="true" />
            Course
          </span>
        )}
        <h3 className="font-serif text-xl font-semibold text-deep-teal text-balance">
          {displayTitle ?? section.title}
        </h3>
        {section.description && (
          <p className="font-serif text-[15px] leading-relaxed text-charcoal/75">
            {section.description}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-charcoal/60">
          <PlayCircle className="size-4" aria-hidden="true" />
          {section.lessonCount} {section.lessonCount === 1 ? noun : `${noun}s`}
        </span>
        <span className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-deep-teal">
          Open
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
