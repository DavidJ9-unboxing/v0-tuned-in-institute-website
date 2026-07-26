import Link from 'next/link'
import { ArrowRight, Layers, PlayCircle } from 'lucide-react'
import type { LibraryCollectionEntry } from '@/lib/content'

export function CollectionCard({ collection }: { collection: LibraryCollectionEntry }) {
  return (
    <Link
      href={`/library/collection/${collection.slug}`}
      className="group flex flex-col justify-between gap-6 rounded-2xl border border-stone bg-card p-6 transition-all hover:border-deep-teal/40 hover:shadow-[0_12px_32px_-20px_rgba(27,80,90,0.45)]"
    >
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-light px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-deep-teal">
          <Layers className="size-3.5" aria-hidden="true" />
          Course
        </span>
        <h3 className="font-serif text-xl font-semibold text-deep-teal text-balance">
          {collection.title}
        </h3>
        {collection.description && (
          <p className="font-serif text-[15px] leading-relaxed text-charcoal/75">
            {collection.description}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-3 font-sans text-sm font-medium text-charcoal/60">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-4" aria-hidden="true" />
            {collection.sectionCount} {collection.sectionCount === 1 ? 'part' : 'parts'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PlayCircle className="size-4" aria-hidden="true" />
            {collection.lessonCount} {collection.lessonCount === 1 ? 'lesson' : 'lessons'}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-deep-teal">
          Open
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  )
}
