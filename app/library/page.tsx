import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import { getSections } from '@/lib/content'
import { RemiChat } from '@/components/library/remi-chat'
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
          Explore our collection of articles, guides, and videos on parenting, relationships, and
          family wellbeing. Scroll down to browse the library, or ask Remi to help you find what
          you need.
        </p>
      </header>

      <div className="mt-8">
        <RemiChat initialQuery={initialQuery} />
      </div>

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
        <section className="mt-12" aria-label="Collections">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-charcoal/55">
            Browse all collections
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {sections.map((s) => (
              <SectionCard key={s.id} section={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
