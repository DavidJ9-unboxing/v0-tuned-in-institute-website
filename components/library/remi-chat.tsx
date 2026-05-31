'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  ArrowUp,
  ExternalLink,
  FileText,
  Loader2,
  PlayCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

function KindIcon({ kind }: { kind: string }) {
  if (kind === 'article') {
    return <FileText className="size-4 shrink-0 text-sage-deep" aria-hidden="true" />
  }
  if (kind === 'link') {
    return <ExternalLink className="size-4 shrink-0 text-sage-deep" aria-hidden="true" />
  }
  return <PlayCircle className="size-4 shrink-0 text-deep-teal" aria-hidden="true" />
}

function RemiAvatar() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone bg-card">
      <Image
        src="/logos/tii-logo-mark.png"
        alt=""
        width={28}
        height={28}
        className="size-7 object-contain"
      />
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

export function RemiChat({ initialQuery = '' }: { initialQuery?: string }) {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/library/remi' }),
  })
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const didAutoSend = useRef(false)

  const busy = status === 'submitted' || status === 'streaming'

  // Auto-send a question passed in from the public search bar (/library?q=…).
  useEffect(() => {
    if (initialQuery.trim() && !didAutoSend.current) {
      didAutoSend.current = true
      sendMessage({ text: initialQuery.trim() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  // Keep the latest message in view as it streams.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    sendMessage({ text: trimmed })
    setInput('')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit(input)
  }

  const hasConversation = messages.length > 0

  return (
    <div className="overflow-hidden rounded-2xl border border-stone bg-paper">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stone bg-card px-5 py-4">
        <RemiAvatar />
        <div className="flex flex-col">
          <span className="font-serif text-[16px] font-semibold text-deep-teal">Remi</span>
          <span className="font-sans text-xs text-charcoal/55">
            Your Tuned In Institute guide
          </span>
        </div>
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex max-h-[28rem] min-h-[18rem] flex-col gap-5 overflow-y-auto px-5 py-6"
        aria-live="polite"
      >
        {!hasConversation && (
          <div className="flex items-start gap-3">
            <RemiAvatar />
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-stone bg-card px-4 py-3">
              <p className="font-serif text-[15px] leading-relaxed text-charcoal/85">
                Hi, I&apos;m Remi. Tell me what&apos;s on your mind — a hard moment with your child,
                or something you&apos;re carrying yourself — and I&apos;ll point you to the
                Institute resources that can help.
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === 'user'
          return (
            <div
              key={message.id}
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
                  if (part.type === 'tool-citeResources' && part.state === 'output-available') {
                    const output = part.output as { resources: RemiResource[] }
                    return <ResourceCards key={i} resources={output.resources} />
                  }
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
                Sorry, I had trouble responding just then. Please try again in a moment.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Suggested prompts (only before a conversation starts) */}
      {!hasConversation && (
        <div className="flex flex-wrap gap-2 px-5 pb-4">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => submit(ex)}
              className="rounded-full border border-stone bg-card px-3 py-1.5 font-sans text-xs text-charcoal/75 transition-colors hover:border-deep-teal/40 hover:text-deep-teal"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={onSubmit} className="border-t border-stone bg-card px-4 py-3">
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
            placeholder="Message Remi…"
            aria-label="Message Remi"
            className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-stone bg-off-white px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/45 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
          />
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
    </div>
  )
}
