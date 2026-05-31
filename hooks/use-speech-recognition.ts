'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal typings for the Web Speech API, which isn't in the default DOM lib.
type SpeechRecognitionResultLike = {
  0: { transcript: string }
  isFinal: boolean
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition({
  onSessionTranscript,
  lang = 'en-US',
}: {
  // Called with the FULL transcript for the current listening session (finalized + interim).
  // It replaces, rather than appends, so the consumer should set `base + sessionTranscript`.
  onSessionTranscript: (sessionTranscript: string) => void
  lang?: string
}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  // Accumulates only the finalized text for the current session; interim is added per-event.
  const finalTranscriptRef = useRef('')
  // Keep the latest callback without re-creating the recognition instance.
  const onTranscriptRef = useRef(onSessionTranscript)
  onTranscriptRef.current = onSessionTranscript

  useEffect(() => {
    const Ctor = getRecognitionConstructor()
    if (!Ctor) {
      setIsSupported(false)
      return
    }
    setIsSupported(true)

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let interim = ''
      // Walk every result: append finalized chunks once, collect the live interim tail.
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        if (result.isFinal) {
          finalTranscriptRef.current += transcript
        } else {
          interim += transcript
        }
      }
      const combined = (finalTranscriptRef.current + interim).replace(/\s+/g, ' ').trim()
      onTranscriptRef.current(combined)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition

    return () => {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [lang])

  const start = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition || isListening) return
    try {
      finalTranscriptRef.current = ''
      recognition.start()
      setIsListening(true)
    } catch {
      // start() throws if already started; ignore.
    }
  }, [isListening])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const toggle = useCallback(() => {
    if (isListening) stop()
    else start()
  }, [isListening, start, stop])

  return { isListening, isSupported, start, stop, toggle }
}
