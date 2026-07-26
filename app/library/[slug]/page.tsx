import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getCollectionById, getLessonsForSection, getSectionBySlug } from '@/lib/content'
import { LessonViewer } from '@/components/library/lesson-viewer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const section = await getSectionBySlug(slug)
  return { title: section?.title ?? 'Collection' }
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lesson?: string }>
}) {
  const { slug } = await params
  const { lesson: lessonParam } = await searchParams
  const section = await getSectionBySlug(slug)
  if (!section) notFound()

  const lessons = await getLessonsForSection(section.id)
  const initialLessonId = lessonParam ? Number(lessonParam) : undefined

  // If this section belongs to a collection, the back-link returns to the
  // collection page; otherwise it returns to the library home.
  const parentCollection = section.collectionId
    ? await getCollectionById(section.collectionId)
    : null
  const backHref = parentCollection ? `/library/collection/${parentCollection.slug}` : '/library'
  const backLabel = parentCollection ? parentCollection.title : 'All collections'

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-deep-teal hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <header className="mt-4 flex flex-col gap-2 border-b border-stone pb-8">
        <h1 className="font-serif text-3xl font-semibold text-deep-teal sm:text-4xl text-balance">
          {section.title}
        </h1>
        {section.description && (
          <p className="max-w-2xl font-serif text-[16px] leading-relaxed text-charcoal/75">
            {section.description}
          </p>
        )}
      </header>

      <div className="mt-8">
        <LessonViewer
          lessons={lessons}
          initialLessonId={initialLessonId}
          indexFirst={slug === 'caregiver-handouts'}
        />
      </div>
    </div>
  )
}
