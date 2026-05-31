import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import { getSections } from '@/lib/content'
import { LibraryAiSearch } from '@/components/library/library-ai-search'
import { SectionCard } from '@/components/library/section-card'

export const metadata: Metadata = {
  title: 'Content Library',
  description: 'Your Tuned In Institute content library.',
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const user = await getCurrentUser()
  const sections = await getSections()
  const { q } = await searchParams
  const initialQuery = typeof q === 'string' ? q : ''

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="flex flex-col gap-2">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">
          Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}
        </p>
        <h1 className="font-serif text-3xl font-semibold text-deep-teal sm:text-4xl text-balance">
          Your content library
        </h1>
        <p className="max-w-2xl font-serif text-[16px] leading-relaxed text-charcoal/75">
          Ask in your own words and the concierge will find the most relevant resources, or browse
          the collections below.
        </p>
      </header>

      <div className="mt-8">
        <LibraryAiSearch initialQuery={initialQuery}>
          {sections.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-stone bg-card px-8 py-16 text-center">
              <BookOpen className="size-10 text-charcoal/30" aria-hidden="true" />
              <h2 className="font-serif text-xl font-semibold text-deep-teal">
                Your library is being prepared
              </h2>
              <p className="max-w-md font-serif text-[15px] leading-relaxed text-charcoal/70">
                Content collections will appear here soon. Check back shortly, or reach out to the
                Institute team if you were expecting access to a specific program.
              </p>
            </div>
          ) : (
            <section className="mt-10 grid gap-5 sm:grid-cols-2" aria-label="Collections">
              {sections.map((s) => (
                <SectionCard key={s.id} section={s} />
              ))}
            </section>
          )}
        </LibraryAiSearch>
      </div>
    </div>
  )
}
