import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Headphones, Video, BookOpen, Download, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/site/page-hero'
import { SectionLabel } from '@/components/site/section-label'
import { SearchBar } from '@/components/site/search-bar'
import { getCurrentUser } from '@/lib/session'

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

const featured = [
  {
    tag: 'Article',
    title: 'The science of the meltdown: what is happening in a sensitive nervous system',
    body: 'A plain-language walk through overstimulation, the window of tolerance, and why willpower is the wrong tool.',
  },
  {
    tag: 'Worksheet',
    title: 'The bedtime wind-down plan for sensitive kids',
    body: 'A step-by-step, printable routine that lowers nighttime arousal and makes sleep easier for the whole house.',
  },
  {
    tag: 'Quick guide',
    title: 'Scripts for the moment your child says &ldquo;I&apos;m too much&rdquo;',
    body: 'Exact words to use when a sensitive child voices shame, plus what to avoid.',
  },
  {
    tag: 'Article',
    title: 'Highly sensitive adults at work: designing an environment that fits',
    body: 'Practical adjustments and language for managers, open offices, and back-to-back meetings.',
  },
]

export default async function ResourcesPage() {
  const user = await getCurrentUser()
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
          <SearchBar placeholder="Try: my 4 year old melts down at pickup" isMember={!!user} />
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
              <div key={r.title} className="rounded-xl border border-stone bg-card p-7">
                <div className="flex size-11 items-center justify-center rounded-lg bg-sage-light text-deep-teal">
                  <r.icon className="size-5" />
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-deep-teal">{r.title}</h3>
                <p className="mt-2 font-serif text-[15px] leading-relaxed text-charcoal/80">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured resources */}
      <section className="border-y border-stone bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <SectionLabel>Featured</SectionLabel>
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Start with these.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featured.map((f) => (
              <article
                key={f.title}
                className="flex flex-col rounded-xl border border-stone bg-card p-7"
              >
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-deep">
                  {f.tag}
                </span>
                <h3
                  className="mt-3 font-serif text-xl font-semibold leading-snug text-deep-teal"
                  dangerouslySetInnerHTML={{ __html: f.title }}
                />
                <p
                  className="mt-3 flex-1 font-serif text-[15px] leading-relaxed text-charcoal/80"
                  dangerouslySetInnerHTML={{ __html: f.body }}
                />
                <span className="mt-5 font-sans text-sm font-semibold text-charcoal/45">
                  Members only
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

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
            <Button
              asChild
              size="lg"
              className="bg-off-white font-sans font-semibold text-deep-teal hover:bg-off-white/90"
            >
              <Link href="/request-access">Request Access</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-off-white/40 bg-transparent font-sans font-semibold text-off-white hover:bg-off-white hover:text-deep-teal"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
