'use client'

import { useRef, useState } from 'react'
import { ArrowUp, Mic, Sparkles } from 'lucide-react'
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
  // The text that existed when the current dictation session began.
  const dictationBaseRef = useRef('')

  // Voice-to-text: replace this session's dictation onto the text present before listening began.
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
    // Capture the existing text so dictation is appended, not overwritten.
    dictationBaseRef.current = value
    start()
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isListening) stopListening()
    dictationBaseRef.current = ''
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
              isSupported && value.trim() ? 'pr-24' : isSupported ? 'pr-14' : 'pr-4',
            )}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {isSupported && (
              <button
                type="button"
                onClick={toggleMic}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                aria-pressed={isListening}
                className={cn(
                  'flex size-10 items-center justify-center rounded-lg transition-colors',
                  isListening
                    ? 'animate-pulse bg-deep-teal text-off-white'
                    : 'text-charcoal/60 hover:bg-sage-light hover:text-deep-teal',
                )}
              >
                <Mic className="size-5" aria-hidden="true" />
              </button>
            )}
            {value.trim() && (
              <button
                type="submit"
                aria-label="Send message to Remi"
                className="flex size-10 items-center justify-center rounded-lg bg-deep-teal text-off-white transition-colors hover:bg-teal-mid"
              >
                <ArrowUp className="size-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <Button type="submit" size="lg" className="h-14 gap-2 px-7 font-sans font-semibold">
          <Sparkles className="size-4" aria-hidden="true" />
          Ask Remi
        </Button>
      </div>
    </form>
  )
}
