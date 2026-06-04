'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Share2, Square, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ChatGPT-style action row shown beneath each of Remi's replies, letting members
// copy the message, listen to it read aloud, or share it. Kept intentionally quiet
// (small, muted icons) so it never competes with the conversation itself.
export function MessageActions({
  text,
  isSpeaking,
  speechSupported,
  onToggleSpeak,
}: {
  /** The plain-text content of this message. */
  text: string
  /** Whether this specific message is currently being read aloud. */
  isSpeaking: boolean
  /** Whether the browser supports text-to-speech at all. */
  speechSupported: boolean
  /** Start/stop reading this message aloud. */
  onToggleSpeak: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  // Reset the transient "copied/shared" confirmations after a moment.
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])
  useEffect(() => {
    if (!shared) return
    const t = setTimeout(() => setShared(false), 1800)
    return () => clearTimeout(t)
  }, [shared])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard can be blocked (e.g. insecure context); fail quietly.
    }
  }

  async function handleShare() {
    // Prefer the native share sheet on mobile; fall back to copying so the action
    // always does something useful on desktop browsers without Web Share.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch {
        // User dismissed the share sheet, or it failed — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShared(true)
    } catch {
      // Ignore; nothing else we can do safely.
    }
  }

  const btn =
    'flex size-7 items-center justify-center rounded-md text-charcoal/45 transition-colors hover:bg-card hover:text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/30'

  return (
    <div className="mt-1.5 flex items-center gap-0.5" aria-label="Message actions">
      <button type="button" onClick={handleCopy} className={btn} aria-label={copied ? 'Copied' : 'Copy message'}>
        {copied ? (
          <Check className="size-4 text-deep-teal" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
      </button>

      {speechSupported && (
        <button
          type="button"
          onClick={onToggleSpeak}
          className={cn(btn, isSpeaking && 'text-deep-teal')}
          aria-label={isSpeaking ? 'Stop reading aloud' : 'Listen to message'}
          aria-pressed={isSpeaking}
        >
          {isSpeaking ? (
            <Square className="size-3.5 fill-current" aria-hidden="true" />
          ) : (
            <Volume2 className="size-4" aria-hidden="true" />
          )}
        </button>
      )}

      <button type="button" onClick={handleShare} className={btn} aria-label={shared ? 'Copied to share' : 'Share message'}>
        {shared ? (
          <Check className="size-4 text-deep-teal" aria-hidden="true" />
        ) : (
          <Share2 className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
