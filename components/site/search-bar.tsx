'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SearchBar({
  placeholder = 'Ask anything about sensitivity, your child, or yourself…',
  isMember = false,
}: {
  placeholder?: string
  /** When true, the search runs against the live library concierge. */
  isMember?: boolean
}) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    // Members go straight into the live concierge in the library with their
    // question pre-filled. Everyone else sees the coming-soon notice.
    if (isMember) {
      if (!trimmed) return
      router.push(`/library?q=${encodeURIComponent(trimmed)}`)
      return
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <form onSubmit={onSubmit} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-teal-mid" />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              aria-label="Ask the Tuned In concierge"
              className="h-14 w-full rounded-xl border border-stone bg-card pl-12 pr-4 font-sans text-[15px] text-charcoal placeholder:text-charcoal/45 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-7 font-sans font-semibold">
            Ask
          </Button>
        </div>
      </form>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="concierge-soon-title"
        >
          <div
            className="absolute inset-0 bg-deep-teal/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-stone bg-card p-8 text-center shadow-[0_30px_60px_-25px_rgba(27,80,90,0.55)]">
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-md text-charcoal/55 transition-colors hover:bg-sage-light hover:text-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
            >
              <X className="size-5" />
            </button>
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-sage-light text-deep-teal">
              <Sparkles className="size-7" />
            </span>
            <p className="mt-5 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-teal-mid">
              Coming soon
            </p>
            <h2
              id="concierge-soon-title"
              className="mt-2 font-serif text-2xl font-semibold leading-tight text-deep-teal"
            >
              The Concierge isn&apos;t live yet
            </h2>
            <p className="mt-3 font-serif text-[15px] leading-relaxed text-charcoal/80">
              Our AI concierge, trained on the Tuned In curriculum, is in development. Rooted Rhythm
              clients with library access will be the first to ask it anything.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="font-sans font-semibold">
                <a href="/request-access">Request Access</a>
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-deep-teal/30 bg-transparent font-sans font-semibold text-deep-teal hover:bg-sage-light"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
