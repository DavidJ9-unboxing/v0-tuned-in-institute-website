'use client'

import { useRef, useState } from 'react'
import { Mic, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRemi } from '@/components/library/remi-launcher'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { cn } from '@/lib/utils'

export function SearchBar({
  placeholder = 'Ask anything about sensitivity, your child, or yourself…',
}: {
  placeholder?: string
}) {
  const { open } = useRemi()
  const [value, setValue] = useState('')
  // Tracks the in-progress (interim) dictation so it can be replaced as speech is refined.
  const interimRef = useRef('')

  function handleTranscript(transcript: string, isFinal: boolean) {
    setValue((prev) => {
      const interim = interimRef.current
      const base =
        interim && prev.endsWith(interim) ? prev.slice(0, prev.length - interim.length) : prev
      const sep = base && !base.endsWith(' ') ? ' ' : ''
      if (isFinal) {
        interimRef.current = ''
        return `${base}${sep}${transcript.trim()} `
      }
      interimRef.current = transcript
      return `${base}${sep}${transcript}`
    })
  }

  const { isListening, isSupported, toggle, stop: stopListening } = useSpeechRecognition({
    onTranscript: handleTranscript,
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isListening) stopListening()
    interimRef.current = ''
    // Open Remi in the slide-over panel, pre-filling the typed question.
    open(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Sparkles className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-teal-mid" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            aria-label="Ask Remi, the Tuned In Institute AI concierge"
            className={cn(
              'h-14 w-full rounded-xl border border-stone bg-card pl-12 font-sans text-[15px] text-charcoal placeholder:text-charcoal/45 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20',
              isSupported ? 'pr-14' : 'pr-4',
            )}
          />
          {isSupported && (
            <button
              type="button"
              onClick={toggle}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              aria-pressed={isListening}
              className={cn(
                'absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg transition-colors',
                isListening
                  ? 'animate-pulse bg-deep-teal text-off-white'
                  : 'text-charcoal/60 hover:bg-sage-light hover:text-deep-teal',
              )}
            >
              <Mic className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>
        <Button type="submit" size="lg" className="h-14 gap-2 px-7 font-sans font-semibold">
          <Sparkles className="size-4" aria-hidden="true" />
          Ask Remi
        </Button>
      </div>
    </form>
  )
}
