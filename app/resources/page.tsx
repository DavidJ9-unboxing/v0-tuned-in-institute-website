import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FileText,
  Headphones,
  Video,
  BookOpen,
  Download,
  ListChecks,
  ArrowRight,
} from 'lucide-react'
import { AccessCta, SignInCta } from '@/components/site/access-cta'
import { PageHero } from '@/components/site/page-hero'
import { SectionLabel } from '@/components/site/section-label'
import { SearchBar } from '@/components/site/search-bar'
import { getCurrentUser } from '@/lib/session'
import { getFeaturedLessons } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'A growing library of articles, worksheets, audio, and video on raising and being a sensitive human, all searchable in plain language.',
}

const resourceTypes = [
  { icon: Video, title: 'Video lessons', body: 'Short, clear teaching from every program module.' },
  { icon: Headphones, title: 'Audio versions', body: 'Listen on a walk, a commute, or a quiet night.' },
  { icon: FileText, title: 'Transcripts', body: 'Every lesson in readable, searchable text.' },
  { icon: Download, title: 'Worksheets', body: 'Printable scripts, trackers, and reflection guides.' },
  { icon: ListChecks, title: 'Quick guides', body: 'One-page references for the hardest moments.' },
  { icon: BookOpen, title: 'Articles', body: 'Deep dives into the science, in plain language.' },
]

// Human-readable label for each lesson kind, used on the featured cards.
const kindLabel: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  link: 'Resource',
  document: 'Document',
}

export default async function ResourcesPage() {
  const user = await getCurrentUser()
  const featured = await getFeaturedLessons(4)
  // Members go straight into the library; guests are routed to request access.
  const browseHref = user ? '/library' : '/request-access'
  return (
    <>
      <PageHero
        label="The library"
        title="A growing library for sensitive humans."
        intro="Articles, worksheets, audio, and video, all grounded in the same research as our programs. Search in plain language and find exactly what you need."
      />

      {/* Search */}
      <section className="border-b border-stone bg-sage-light">
        <div className="mx-auto max-w-4xl px-5 py-12 text-center sm:px-8">
          <SearchBar placeholder="Try: my 4 year old melts down at pickup" />
          <p className="mt-4 font-sans text-sm text-deep-teal/80">
            {user
              ? 'Ask a real question — the concierge searches your full library for what fits.'
              : 'Ask a real question. Clients get personalized concierge answers.'}
          </p>
        </div>
      </section>

      {/* Resource types */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <SectionLabel>What&apos;s inside</SectionLabel>
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Six kinds of resources, one library.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resourceTypes.map((r) => (
              <Link
                key={r.title}
                href={browseHref}
                className="group flex flex-col rounded-xl border border-stone bg-card p-7 transition-all hover:border-deep-teal/40 hover:shadow-[0_12px_32px_-20px_rgba(27,80,90,0.45)]"
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-sage-light text-deep-teal">
                  <r.icon className="size-5" />
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-deep-teal">{r.title}</h3>
                <p className="mt-2 flex-1 font-serif text-[15px] leading-relaxed text-charcoal/80">
                  {r.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 font-sans text-sm font-semibold text-deep-teal">
                  {user ? 'Browse in library' : 'Request access'}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured resources */}
      {featured.length > 0 && (
        <section className="border-y border-stone bg-paper">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <SectionLabel>Featured</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
              Start with these.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {featured.map((f) => {
                // Members deep-link into the exact lesson; guests are routed to
                // request access since the library is members-only.
                const href = user
                  ? `/library/${f.sectionSlug}?lesson=${f.id}`
                  : '/request-access'
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
                      {f.title}
                    </h3>
                    {f.description && (
                      <p className="mt-3 flex-1 font-serif text-[15px] leading-relaxed text-charcoal/80">
                        {f.description}
                      </p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1 font-sans text-sm font-semibold text-deep-teal">
                      {user ? 'Open' : 'Members only — request access'}
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-deep-teal text-off-white">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            Unlock the full library.
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-off-white/85">
            Access opens every article, worksheet, and video, plus all four program tracks, for
            Rooted Rhythm clients.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <AccessCta
              className="bg-off-white font-sans font-semibold text-deep-teal hover:bg-off-white/90"
            />
            <SignInCta
              className="border-off-white/40 bg-transparent font-sans font-semibold text-off-white hover:bg-off-white hover:text-deep-teal"
            />
          </div>
        </div>
      </section>
    </>
  )
}
