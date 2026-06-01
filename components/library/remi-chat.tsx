'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  ArrowUp,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  LifeBuoy,
  Loader2,
  Lock,
  Mic,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'

const CRISIS_RESOURCE_URL =
  'https://988lifeline.org/learn/our-crisis-centers/crisis-centers-by-state-and-u-s-territory/'

type RemiResource = {
  id: number
  title: string
  kind: string
  sectionSlug: string
  sectionTitle: string
  externalUrl: string | null
}

const EXAMPLES = [
  'My 4-year-old melts down at bedtime',
  'I feel burned out and guilty',
  'My child refuses to go to school',
  'How do I set boundaries calmly?',
]

// Distinguish "Remi is temporarily busy" (rate limit / overload) from genuine errors,
// so members see a calm, reassuring note instead of a scary failure.
function isBusyError(error?: Error): boolean {
  if (!error) return false
  const text = `${error.message} ${(error as { cause?: string }).cause ?? ''}`.toLowerCase()
  return (
    text.includes('rate limit') ||
    text.includes('rate_limit') ||
    text.includes('429') ||
    text.includes('overloaded') ||
    text.includes('too many requests') ||
    text.includes('quota') ||
    text.includes('capacity')
  )
}

function KindIcon({ kind }: { kind: string }) {
  if (kind === 'article') {
    return <FileText className="size-4 shrink-0 text-sage-deep" aria-hidden="true" />
  }
  if (kind === 'link') {
    return <ExternalLink className="size-4 shrink-0 text-sage-deep" aria-hidden="true" />
  }
  if (kind === 'document') {
    return <Download className="size-4 shrink-0 text-sage-deep" aria-hidden="true" />
  }
  return <PlayCircle className="size-4 shrink-0 text-deep-teal" aria-hidden="true" />
}

function RemiAvatar() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-deep-teal">
      <Sparkles className="size-4 text-off-white" aria-hidden="true" />
      <span className="sr-only">Remi</span>
    </span>
  )
}

function ResourceCards({ resources }: { resources: RemiResource[] }) {
  if (!resources?.length) return null
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {resources.map((r) => (
        <li key={r.id}>
          <Link
            href={`/library/${r.sectionSlug}?lesson=${r.id}`}
            className="flex items-start gap-2.5 rounded-lg border border-stone bg-card px-3.5 py-3 transition-colors hover:border-deep-teal/40"
          >
            <span className="mt-0.5">
              <KindIcon kind={r.kind} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-serif text-[15px] font-semibold leading-snug text-charcoal">
                {r.title}
              </span>
              <span className="font-sans text-[11px] uppercase tracking-wide text-charcoal/45">
                {r.sectionTitle}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function RemiChat({
  initialQuery = '',
  variant = 'page',
}: {
  initialQuery?: string
  variant?: 'page' | 'panel'
}) {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/library/remi' }),
  })
  const [input, setInput] = useState('')
  // In the slide-over the resource list is collapsed by default so it doesn't eat the small
  // mobile screen; members still see a labelled, tappable header telling them links are there.
  const [resourcesOpen, setResourcesOpen] = useState(false)
  // Privacy note is collapsed by default; the header shows a one-line summary. Once a member
  // reads it and dismisses it, it's hidden for the rest of the session (not persisted).
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [privacyDismissed, setPrivacyDismissed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastUserRef = useRef<HTMLDivElement>(null)
  const didAutoSend = useRef(false)
  // The message text that existed when the current dictation session began.
  const dictationBaseRef = useRef('')

  const isPanel = variant === 'panel'
  const busy = status === 'submitted' || status === 'streaming'

  // Voice-to-text: replace this session's dictation onto the text present before listening began.
  function handleSessionTranscript(sessionTranscript: string) {
    const base = dictationBaseRef.current
    const sep = base && !base.endsWith(' ') ? ' ' : ''
    setInput(sessionTranscript ? `${base}${sep}${sessionTranscript}` : base)
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
    dictationBaseRef.current = input
    start()
  }

  // Auto-send a question passed in from the public search bar (/library?q=…).
  useEffect(() => {
    if (initialQuery.trim() && !didAutoSend.current) {
      didAutoSend.current = true
      sendMessage({ text: initialQuery.trim() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const userMessageCount = messages.filter((m) => m.role === 'user').length

  // When a new question is asked, pin that question to the top of the scroll area so the
  // answer reads top-down below it, instead of snapping to the bottom and forcing a scroll up.
  useEffect(() => {
    const container = scrollRef.current
    const anchor = lastUserRef.current
    if (!container || !anchor) return
    container.scrollTo({ top: anchor.offsetTop - 16, behavior: 'smooth' })
  }, [userMessageCount])

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    if (isListening) stopListening()
    dictationBaseRef.current = ''
    sendMessage({ text: trimmed })
    setInput('')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit(input)
  }

  const hasConversation = messages.length > 0

  // The most recent thing the member said, so the error note can offer a one-tap retry.
  const lastUserText = [...messages]
    .reverse()
    .find((m) => m.role === 'user')
    ?.parts.filter((p) => p.type === 'text')
    .map((p) => (p as { text: string }).text)
    .join('')
    .trim()

  // Collect every resource Remi has cited across the whole conversation,
  // de-duplicated and shown together below the dialogue.
  const sharedResources: RemiResource[] = []
  const seen = new Set<number>()
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === 'tool-citeResources' && part.state === 'output-available') {
        const output = part.output as { resources: RemiResource[] }
        for (const r of output.resources ?? []) {
          if (!seen.has(r.id)) {
            seen.add(r.id)
            sharedResources.push(r)
          }
        }
      }
    }
  }

  const resourceCount = sharedResources.length

  const resourcesPanel = resourceCount > 0 &&
    (isPanel ? (
      // Slide-over: collapsible so the dialogue keeps the small mobile screen. The header
      // always shows so members know links are available, with a count and a toggle.
      <section
        aria-label="Resources Remi shared"
        className="shrink-0 border-t border-stone bg-paper"
      >
        <button
          type="button"
          onClick={() => setResourcesOpen((v) => !v)}
          aria-expanded={resourcesOpen}
          className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left transition-colors hover:bg-card/60"
        >
          <span className="flex items-center gap-2">
            <FileText className="size-4 shrink-0 text-deep-teal" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/65">
              {resourceCount} resource{resourceCount > 1 ? 's' : ''} below
            </span>
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-charcoal/55 transition-transform',
              resourcesOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
        {resourcesOpen && (
          <div className="max-h-44 overflow-y-auto px-5 pb-4 pr-1">
            <ResourceCards resources={sharedResources} />
          </div>
        )}
      </section>
    ) : (
      <section
        aria-label="Resources Remi shared"
        className="rounded-2xl border border-stone bg-paper px-5 py-5"
      >
        <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/55">
          Resources Remi shared
        </h3>
        <ResourceCards resources={sharedResources} />
      </section>
    ))

  const privacyNote = privacyDismissed ? null : (
    <section
      aria-label="Privacy and confidentiality"
      className={cn(
        'border-stone bg-paper',
        isPanel ? 'shrink-0 border-t' : 'rounded-xl border',
      )}
    >
      <button
        type="button"
        onClick={() => setPrivacyOpen((v) => !v)}
        aria-expanded={privacyOpen}
        className={cn(
          'flex w-full items-center justify-between gap-2 text-left transition-colors hover:bg-card/60',
          isPanel ? 'px-5 py-3' : 'rounded-xl px-4 py-3',
        )}
      >
        <span className="flex items-center gap-2.5">
          <Lock className="size-4 shrink-0 text-deep-teal" aria-hidden="true" />
          <span className="font-sans text-xs leading-relaxed text-charcoal/65">
            <span className="font-semibold text-charcoal">Privacy &amp; Confidentiality:</span> Remi is
            powered by OpenAI.{' '}
            <span className="text-deep-teal">{privacyOpen ? 'Show less' : 'Read more'}</span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-charcoal/55 transition-transform',
            privacyOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {privacyOpen && (
        <div
          className={cn(
            'flex flex-col gap-3 font-sans text-xs leading-relaxed text-charcoal/65',
            isPanel ? 'px-5 pb-4 pl-[2.65rem]' : 'px-4 pb-4 pl-[2.4rem]',
          )}
        >
          <p>
            Chats aren&apos;t saved and Remi is{' '}
            <span className="font-medium text-charcoal/80">not HIPAA-compliant</span>, so please skip
            full names, addresses, and other identifying details. Ask Remi for a summary if you&apos;d
            like to continue later.
          </p>
          <button
            type="button"
            onClick={() => setPrivacyDismissed(true)}
            className="self-start rounded-lg border border-stone bg-card px-3 py-1.5 font-sans text-xs font-medium text-deep-teal transition-colors hover:border-deep-teal/40"
          >
            Got it
          </button>
        </div>
      )}
    </section>
  )

  const safetyNote = (
    <div
      className={cn(
        'flex items-start gap-2.5 border-stone bg-card',
        isPanel ? 'shrink-0 border-t px-5 py-3' : 'rounded-xl border px-4 py-3',
      )}
    >
      <LifeBuoy className="mt-0.5 size-4 shrink-0 text-deep-teal" aria-hidden="true" />
      <p className="font-sans text-xs leading-relaxed text-charcoal/65">
        Remi is a guide, not a therapist or crisis service. If you&apos;re in immediate danger, call
        your local emergency number (911 in the US) or call or text 988. You can also find a{' '}
        <a
          href={CRISIS_RESOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-deep-teal underline underline-offset-2 hover:text-teal-mid"
        >
          crisis center near you
        </a>
        .
      </p>
    </div>
  )

  return (
    <div className={cn(isPanel ? 'flex h-full min-h-0 flex-col' : 'flex flex-col gap-4')}>
      <div
        className={cn(
          'bg-paper',
          isPanel
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
            : 'overflow-hidden rounded-2xl border border-stone',
        )}
      >
        {/* Header (hidden in panel — the slide-over has its own title bar) */}
        {!isPanel && (
          <div className="flex items-center gap-3 border-b border-stone bg-card px-5 py-4">
            <RemiAvatar />
            <div className="flex flex-col">
              <span className="font-serif text-[16px] font-semibold text-deep-teal">Remi</span>
              <span className="font-sans text-xs text-charcoal/55">
                Your Tuned In Institute guide
              </span>
            </div>
          </div>
        )}

        {/* Conversation */}
        <div
          ref={scrollRef}
          className={cn(
            'flex flex-col gap-5 overflow-y-auto px-5 py-6',
            isPanel ? 'min-h-0 flex-1' : 'max-h-[28rem] min-h-[18rem]',
          )}
          aria-live="polite"
        >
          {!hasConversation && (
            <div className="flex items-start gap-3">
              <RemiAvatar />
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-stone bg-card px-4 py-3">
                <p className="font-serif text-[15px] leading-relaxed text-charcoal/85">
                  Hi, I&apos;m Remi. I&apos;m here to talk things through with you — a hard moment
                  with your child, or something you&apos;re carrying yourself. Share whatever&apos;s
                  on your mind.{' '}
                  <span className="text-charcoal/60">
                    (Chat is private and not saved but avoid full names and identifying details.)
                  </span>
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            const isLastUser =
              isUser && !messages.slice(index + 1).some((m) => m.role === 'user')
            return (
              <div
                key={message.id}
                ref={isLastUser ? lastUserRef : undefined}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {isUser ? (
                  <span className="size-8 shrink-0" aria-hidden="true" />
                ) : (
                  <RemiAvatar />
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'rounded-tr-sm bg-deep-teal text-off-white'
                      : 'rounded-tl-sm border border-stone bg-card text-charcoal/85'
                  }`}
                >
                  {message.parts.map((part, i) => {
                    if (part.type === 'text') {
                      return (
                        <p
                          key={i}
                          className={`whitespace-pre-wrap font-serif text-[15px] leading-relaxed ${
                            isUser ? 'text-off-white' : 'text-charcoal/85'
                          }`}
                        >
                          {part.text}
                        </p>
                      )
                    }
                    // Cited resources are collected and shown below the dialogue,
                    // not inline in the conversation bubbles.
                    return null
                  })}
                </div>
              </div>
            )
          })}

          {status === 'submitted' && (
            <div className="flex items-start gap-3">
              <RemiAvatar />
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-stone bg-card px-4 py-3">
                <Loader2 className="size-4 animate-spin text-teal-mid" aria-hidden="true" />
                <span className="font-sans text-sm text-charcoal/55">Remi is thinking…</span>
              </div>
            </div>
          )}

          {status === 'error' || error ? (
            <div className="flex items-start gap-3">
              <RemiAvatar />
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-stone bg-card px-4 py-3">
                <p className="font-serif text-[15px] leading-relaxed text-charcoal/70">
                  {isBusyError(error)
                    ? 'Remi is helping a lot of families right now and needs a moment to catch up. Please try again shortly — your message wasn’t lost.'
                    : 'Sorry, I had trouble responding just then. Please try again in a moment.'}
                </p>
                {lastUserText && (
                  <button
                    type="button"
                    onClick={() => submit(lastUserText)}
                    className="mt-2 font-sans text-xs font-medium text-deep-teal underline underline-offset-2 hover:text-teal-mid"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Suggested prompts (only before a conversation starts) */}
        {!hasConversation && (
          <div className="flex flex-wrap gap-2 px-5 pb-4">
            {EXAMPLES.map((ex, i) => (
              <button
                key={ex}
                type="button"
                onClick={() => submit(ex)}
                className={cn(
                  'rounded-full border border-stone bg-card px-3 py-1.5 font-sans text-xs text-charcoal/75 transition-colors hover:border-deep-teal/40 hover:text-deep-teal',
                  // Keep the chat compact on mobile by showing only the first two prompts.
                  i >= 2 && 'hidden sm:inline-flex',
                )}
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={onSubmit} className="shrink-0 border-t border-stone bg-card px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit(input)
                }
              }}
              rows={1}
              placeholder="Ask Remi…"
              aria-label="Ask Remi"
              className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-stone bg-off-white px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/45 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
            />
            {isSupported && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={toggleMic}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                aria-pressed={isListening}
                className={cn(
                  'size-11 shrink-0 rounded-xl border-stone',
                  isListening
                    ? 'animate-pulse border-deep-teal bg-deep-teal text-off-white hover:bg-deep-teal hover:text-off-white'
                    : 'text-charcoal/70 hover:text-deep-teal',
                )}
              >
                <Mic className="size-5" aria-hidden="true" />
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="size-11 shrink-0 rounded-xl"
            >
              {busy ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowUp className="size-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </form>

        {/* In the slide-over panel, resources + safety stay attached to the chat card. */}
        {isPanel && resourcesPanel}
        {isPanel && safetyNote}
        {isPanel && privacyNote}
      </div>

      {/* On the page, resources + safety sit below the dialogue. */}
      {!isPanel && resourcesPanel}
      {!isPanel && safetyNote}
      {!isPanel && privacyNote}
    </div>
  )
}
