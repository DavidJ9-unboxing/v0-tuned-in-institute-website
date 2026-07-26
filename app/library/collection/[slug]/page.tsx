import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getCollectionBySlug, getSectionsForCollection } from '@/lib/content'
import { SectionCard } from '@/components/library/section-card'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  return { title: collection?.title ?? 'Collection' }
}

/**
 * Strip a leading "<collectionTitle> · " (or "— "/"- ") prefix from a section
 * title so the cards inside a collection read as "Introduction", "Module 1",
 * etc. rather than repeating the course name.
 */
function shortTitle(sectionTitle: string, collectionTitle: string): string {
  const escaped = collectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return sectionTitle.replace(new RegExp(`^${escaped}\\s*[·—-]\\s*`), '').trim() || sectionTitle
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) notFound()

  const sections = await getSectionsForCollection(collection.id)

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-deep-teal hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        All collections
      </Link>

      <header className="mt-4 flex flex-col gap-2 border-b border-stone pb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">
          Course
        </p>
        <h1 className="font-serif text-3xl font-semibold text-deep-teal sm:text-4xl text-balance">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="max-w-2xl font-serif text-[16px] leading-relaxed text-charcoal/75">
            {collection.description}
          </p>
        )}
      </header>

      {sections.length === 0 ? (
        <p className="mt-10 font-serif text-[15px] leading-relaxed text-charcoal/70">
          Content for this course is being prepared. Check back shortly.
        </p>
      ) : (
        <section className="mt-10" aria-label={`${collection.title} contents`}>
          <div className="grid gap-5 sm:grid-cols-2">
            {sections.map((s) => (
              <SectionCard
                key={s.id}
                section={s}
                displayTitle={shortTitle(s.title, collection.title)}
                countNoun="lesson"
                showBadge={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
