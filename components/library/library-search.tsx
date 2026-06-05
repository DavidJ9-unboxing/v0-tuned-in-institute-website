'use client'

import { useRef, useState } from 'react'
import { Mic, Search } from 'lucide-react'
import { useRemi } from '@/components/library/remi-launcher'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { cn } from '@/lib/utils'

/**
 * A traditional-looking library search bar. It looks like a simple search field
 * (magnifying-glass icon, plain input), but you can still type a full natural-language
 * question — submitting hands the query to Remi in the slide-over panel.
 */
export function LibrarySearch({
  initialQuery = '',
  placeholder = 'Search the library — or ask a question in your own words…',
}: {
  initialQuery?: string
  placeholder?: string
}) {
  const { open } = useRemi()
  const [value, setValue] = useState(initialQuery)
  // The text that existed when the current dictation session began.
  const dictationBaseRef = useRef('')

  function handleSessionTranscript(sessionTranscript: string) {
    const base = dictationBaseRef.current
    const sep = base && !base.endsWith(' ') ? ' ' : ''
    setValue(sessionTranscript ? `${base}${sep}${sessionTranscript}` : base)
  }

  const { isListening, isSupported, start, stop: stopListening } = useSpeechRecognition({
    onSessionTranscript: handleSessionTranscript,
  })

  function toggleMic() {
    if (isListening) {
      stopListening()
      return
    }
    dictationBaseRef.current = value
    start()
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const query = value.trim()
    if (!query) return
    if (isListening) stopListening()
    dictationBaseRef.current = ''
    // Hand the natural-language query to Remi in the slide-over panel.
    open(query)
    setValue('')
  }

  return (
    <form onSubmit={onSubmit} className="w-full" role="search">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-charcoal/45"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Search the content library"
          className={cn(
            'h-12 w-full rounded-xl border border-stone bg-card pl-12 font-sans text-[15px] text-charcoal placeholder:text-charcoal/45 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20',
            isSupported ? 'pr-12' : 'pr-4',
          )}
        />
        {isSupported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={isListening ? 'Stop voice input' : 'Search by voice'}
            aria-pressed={isListening}
            className={cn(
              'absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg transition-colors',
              isListening
                ? 'animate-pulse bg-deep-teal text-off-white'
                : 'text-charcoal/55 hover:bg-sage-light hover:text-deep-teal',
            )}
          >
            <Mic className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  )
}
