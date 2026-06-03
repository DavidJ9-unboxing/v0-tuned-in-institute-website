'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Read text aloud using the browser's built-in Speech Synthesis API. This powers the
// "Listen" action on Remi's messages so members can hear a reply instead of reading it.
// Only one utterance plays at a time across the whole app; starting a new one cancels any
// currently playing one. We track which id is speaking so each message's button can show
// the correct play/stop state.
export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false)
  // The id of the message currently being read aloud, or null when nothing is playing.
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    // Stop any narration if the component using this hook unmounts (e.g. panel closes).
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setSpeakingId(null)
  }, [])

  const speak = useCallback(
    (id: string, text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      const synth = window.speechSynthesis
      // Tapping the button for the message that's already playing acts as a stop toggle.
      if (speakingId === id) {
        synth.cancel()
        setSpeakingId(null)
        return
      }
      // Switching to a different message: cancel the old narration first.
      synth.cancel()
      const trimmed = text.trim()
      if (!trimmed) return
      const utterance = new SpeechSynthesisUtterance(trimmed)
      utterance.lang = 'en-US'
      utterance.rate = 1
      utterance.onend = () => setSpeakingId((current) => (current === id ? null : current))
      utterance.onerror = () => setSpeakingId((current) => (current === id ? null : current))
      utteranceRef.current = utterance
      setSpeakingId(id)
      synth.speak(utterance)
    },
    [speakingId],
  )

  return { isSupported, speakingId, speak, stop }
}
