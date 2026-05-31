'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  FileText,
  Loader2,
  PlayCircle,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type SearchHit = {
  id: number
  title: string
  kind: string
  sectionSlug: string
  sectionTitle: string
  externalUrl: string | null
  reason: string
}

type Status = 'idle' | 'loading' | 'done' | 'error'

const EXAMPLES = [
  'My 4-year-old melts down at bedtime',
  'I feel burned out and guilty',
  'My child refuses to go to school',
  'How do I set boundaries calmly?',
]

function KindIcon({ kind }: { kind: string }) {
  if (kind === 'article') {
    return <FileText className="mt-0.5 size-5 shrink-0 text-sage-deep" aria-hidden="true" />
  }
  if (kind === 'link') {
    return <ExternalLink className="mt-0.5 size-5 shrink-0 text-sage-deep" aria-hidden="true" />
  }
  return <PlayCircle className="mt-0.5 size-5 shrink-0 text-deep-teal" aria-hidden="true" />
}

export function LibraryAiSearch({
  children,
  initialQuery = '',
}: {
  children: React.ReactNode
  initialQuery?: string
}) {
  const [value, setValue] = useState(initialQuery)
  const [submitted, setSubmitted] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [results, setResults] = useState<SearchHit[]>([])
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // If the member arrived from the public search bar (e.g. /library?q=…),
  // run their question automatically.
  useEffect(() => {
    if (initialQuery.trim()) {
      runSearch(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  async function runSearch(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return
    setSubmitted(trimmed)
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/library/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = (await res.json()) as { results: SearchHit[] }
      setResults(data.results ?? [])
      setStatus('done')
    } catch {
      setError('Search is temporarily unavailable. Please try again in a moment.')
      setStatus('error')
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    runSearch(value)
  }

  function reset() {
    setValue('')
    setSubmitted('')
    setResults([])
    setStatus('idle')
    setError('')
    inputRef.current?.focus()
  }

  const searching = status !== 'idle'

  return (
    <div>
      <form onSubmit={onSubmit} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Sparkles
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-teal-mid"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Describe what you need help with…"
              aria-label="Ask the library concierge in your own words"
              className="h-14 w-full rounded-xl border border-stone bg-card pl-12 pr-11 font-sans text-[15px] text-charcoal placeholder:text-charcoal/45 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
            />
            {value && (
              <button
                type="button"
                onClick={reset}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={status === 'loading' || !value.trim()}
            className="h-14 px-7 font-sans font-semibold"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Searching
              </>
            ) : (
              'Ask'
            )}
          </Button>
        </div>
      </form>

      {/* Example prompts (only before a search has been run) */}
      {!searching && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-sans text-xs font-medium uppercase tracking-[0.12em] text-charcoal/45">
            Try
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setValue(ex)
                runSearch(ex)
              }}
              className="rounded-full border border-stone bg-card px-3 py-1.5 font-sans text-xs text-charcoal/75 transition-colors hover:border-deep-teal/40 hover:text-deep-teal"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {searching ? (
        <section className="mt-10" aria-label="Search results" aria-live="polite">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-charcoal/60">
              {status === 'loading'
                ? 'Finding the most relevant resources…'
                : status === 'error'
                  ? 'Something went wrong'
                  : `${results.length} ${results.length === 1 ? 'resource' : 'resources'} for “${submitted}”`}
            </h2>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 font-sans text-sm font-medium text-deep-teal hover:underline"
            >
              Clear
            </button>
          </div>

          {status === 'loading' && (
            <ul className="flex flex-col gap-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-stone bg-card"
                />
              ))}
            </ul>
          )}

          {status === 'error' && (
            <p className="rounded-2xl border border-stone bg-card px-6 py-10 text-center font-serif text-[15px] text-charcoal/70">
              {error}
            </p>
          )}

          {status === 'done' && results.length === 0 && (
            <p className="rounded-2xl border border-stone bg-card px-6 py-10 text-center font-serif text-[15px] text-charcoal/70">
              I couldn&apos;t find a close match for that. Try describing it a different way, or
              browse the collections below.
            </p>
          )}

          {status === 'done' && results.length > 0 && (
            <ul className="flex flex-col gap-3">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/library/${r.sectionSlug}?lesson=${r.id}`}
                    className="flex items-start gap-3 rounded-xl border border-stone bg-card px-5 py-4 transition-colors hover:border-deep-teal/40"
                  >
                    <KindIcon kind={r.kind} />
                    <span className="flex flex-col gap-1">
                      <span className="font-serif text-[16px] font-semibold text-charcoal">
                        {r.title}
                      </span>
                      <span className="font-sans text-xs uppercase tracking-wide text-charcoal/45">
                        {r.sectionTitle}
                      </span>
                      <span className="mt-1 font-serif text-[14px] leading-relaxed text-charcoal/70">
                        {r.reason}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        children
      )}
    </div>
  )
}
