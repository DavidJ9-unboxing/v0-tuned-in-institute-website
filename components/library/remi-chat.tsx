'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import {
  ArrowUp,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  Info,
  LifeBuoy,
  Loader2,
  Lock,
  Mic,
  Paperclip,
  PlayCircle,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis'
import { useRemiStore } from '@/components/library/remi-store'
import { MessageActions } from '@/components/library/message-actions'
import { RemiResourceReader } from '@/components/library/remi-resource-reader'

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

// Files members can send to Remi. Images and PDFs are read natively by the model;
// nothing is stored on our servers — each file rides along with that one message only.
const ACCEPTED_FILE_TYPES = 'image/png,image/jpeg,image/webp,image/gif,application/pdf'
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB per file
const MAX_FILES_PER_MESSAGE = 4

type PendingAttachment = {
  id: string
  name: string
  mediaType: string
  /** Data URL (base64). Used both for preview and for sending to the model. */
  url: string
}

function isImageType(mediaType: string) {
  return mediaType.startsWith('image/')
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

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

function ResourceCards({
  resources,
  onOpen,
}: {
  resources: RemiResource[]
  /** Open the resource in the in-chat reader so the conversation is preserved. */
  onOpen: (resource: RemiResource) => void
}) {
  if (!resources?.length) return null
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {resources.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onOpen(r)}
            className="flex w-full items-start gap-2.5 rounded-lg border border-stone bg-card px-3.5 py-3 text-left transition-colors hover:border-deep-teal/40"
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
          </button>
        </li>
      ))}
    </ul>
  )
}

export function RemiChat({
  initialQuery = '',
  variant = 'page',
  intro,
  onTranscriptChange,
}: {
  initialQuery?: string
  variant?: 'page' | 'panel'
  /**
   * The opening greeting Remi shows before any conversation. Defaults to the
   * general message used everywhere; the library passes a tailored one so Remi
   * introduces herself in the context of finding content.
   */
  intro?: React.ReactNode
  /** Emits a plain-text transcript of the conversation whenever it changes. */
  onTranscriptChange?: (transcript: string) => void
}) {
  // Every Remi surface (this page chat and the slide-over panel) shares one conversation
  // via the store, so it survives navigation and stays in sync between surfaces.
  const { chat, remember, setRemember, clearChat } = useRemiStore()
  const { messages, sendMessage, status, error } = useChat({ chat })
  const [input, setInput] = useState('')
  // Files queued to send with the next message. Held only in memory and cleared on send —
  // nothing is uploaded or stored; each file travels with that single message.
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const [attachError, setAttachError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // The resource a member tapped to read inline. When set, the in-chat reader
  // dialog opens on top of the conversation; closing it returns them exactly
  // where they were without losing the chat.
  const [openResource, setOpenResource] = useState<RemiResource | null>(null)
  // In the slide-over the resource list is collapsed by default so it doesn't eat the small
  // mobile screen; members still see a labelled, tappable header telling them links are there.
  const [resourcesOpen, setResourcesOpen] = useState(false)
  // Privacy note is collapsed by default; the header shows a one-line summary. Once a member
  // reads it and dismisses it, it's hidden for the rest of the session (not persisted).
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [privacyDismissed, setPrivacyDismissed] = useState(false)
  // The crisis/safety note can be collapsed to a single tappable line so the privacy note and
  // input have room on small screens. In the slide-over panel (mobile) it starts collapsed so the
  // privacy footer below it stays fully visible; it can be reopened anytime.
  const [safetyCollapsed, setSafetyCollapsed] = useState(variant === 'panel')
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastUserRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
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

  // Text-to-speech for the "Listen" action on each of Remi's replies. A single instance
  // here means only one message reads aloud at a time across the conversation.
  const {
    isSupported: speechSupported,
    speakingId,
    speak,
  } = useSpeechSynthesis()

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

  // Grow the input to fit its content (like ChatGPT/Claude) so members can read back what
  // they've written, capped at ~9 lines (200px = max-h-52), after which it scrolls internally.
  // Re-runs whenever the text changes — including dictation and clearing after send, which
  // snaps it back to a single line.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    const max = 200
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
  }, [input])

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setAttachError(null)
    const incoming = Array.from(fileList)
    const accepted = ACCEPTED_FILE_TYPES.split(',')

    const room = MAX_FILES_PER_MESSAGE - attachments.length
    if (room <= 0) {
      setAttachError(`You can attach up to ${MAX_FILES_PER_MESSAGE} files per message.`)
      return
    }

    const next: PendingAttachment[] = []
    for (const file of incoming.slice(0, room)) {
      if (!accepted.includes(file.type)) {
        setAttachError('Only images (PNG, JPG, WEBP, GIF) and PDFs can be attached.')
        continue
      }
      if (file.size > MAX_FILE_BYTES) {
        setAttachError('Each file must be 10 MB or smaller.')
        continue
      }
      try {
        const url = await readFileAsDataUrl(file)
        next.push({
          id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          name: file.name,
          mediaType: file.type,
          url,
        })
      } catch {
        setAttachError('One of the files could not be read. Please try again.')
      }
    }
    if (incoming.length > room) {
      setAttachError(`You can attach up to ${MAX_FILES_PER_MESSAGE} files per message.`)
    }
    if (next.length) setAttachments((prev) => [...prev, ...next])
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
    setAttachError(null)
  }

  function submit(text: string) {
    const trimmed = text.trim()
    // Allow sending when there's at least text or one attachment.
    if ((!trimmed && attachments.length === 0) || busy) return
    if (isListening) stopListening()
    dictationBaseRef.current = ''
    sendMessage({
      text: trimmed,
      files: attachments.map((a) => ({
        type: 'file' as const,
        mediaType: a.mediaType,
        url: a.url,
        filename: a.name,
      })),
    })
    setInput('')
    setAttachments([])
    setAttachError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit(input)
  }

  const hasConversation = messages.length > 0

  // Guardrail: Remi re-sends the entire conversation to the model on every turn, so a very
  // long thread can eventually crowd the model's context window and the earliest messages
  // (e.g. "I have 5 grandchildren") start getting dropped. We estimate the conversation size
  // from its character count (~4 chars per token is a rough industry heuristic) and gently warn
  // before that happens. The threshold is intentionally conservative and easy to tune.
  const WARN_AFTER_CHARS = 60_000 // ~15k tokens: a genuinely long conversation for this use case
  const conversationChars = useMemo(() => {
    let total = 0
    for (const m of messages) {
      for (const part of m.parts) {
        if (part.type === 'text') total += part.text.length
      }
    }
    return total
  }, [messages])
  const conversationGettingLong = conversationChars >= WARN_AFTER_CHARS
  // Once dismissed, stay quiet for the rest of this session so it isn't nagging.
  const [lengthNoticeDismissed, setLengthNoticeDismissed] = useState(false)
  const showLengthNotice = conversationGettingLong && !lengthNoticeDismissed

  // Publish a plain-text transcript upward so the close dialog can offer "copy & paste to keep it".
  useEffect(() => {
    if (!onTranscriptChange) return
    const transcript = messages
      .map((m) => {
        const text = m.parts
          .filter((p) => p.type === 'text')
          .map((p) => (p as { text: string }).text)
          .join('')
          .trim()
        if (!text) return ''
        return `${m.role === 'user' ? 'You' : 'Remi'}: ${text}`
      })
      .filter(Boolean)
      .join('\n\n')
    onTranscriptChange(transcript)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

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
            <ResourceCards resources={sharedResources} onOpen={setOpenResource} />
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
        <ResourceCards resources={sharedResources} onOpen={setOpenResource} />
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
            Remi is{' '}
            <span className="font-medium text-charcoal/80">not HIPAA-compliant</span>, so please skip
            full names, addresses, and other identifying details. We don&apos;t have access to your
            chat and we never store it on our servers. Your conversation stays available during this
            visit; to keep it for next time, turn on remembering below.
          </p>
          <p>
            You can attach photos, screenshots, or PDFs to give Remi more context. Files are sent
            with that one message and are never stored on our servers — please block out or leave off
            names, faces, and other identifying details before attaching.
          </p>

          {/* Opt-in, device-only memory. Stored in this browser only — never sent to us. */}
          <div className="flex items-start gap-2.5 rounded-lg border border-stone bg-card p-3">
            <button
              type="button"
              role="switch"
              aria-checked={remember}
              onClick={() => setRemember(!remember)}
              className={cn(
                'mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors',
                remember ? 'justify-end bg-deep-teal' : 'justify-start bg-stone',
              )}
            >
              <span className="size-4 rounded-full bg-off-white shadow-sm" />
              <span className="sr-only">Remember my conversations on this device</span>
            </button>
            <span className="flex flex-col gap-0.5">
              <span className="font-sans text-xs font-semibold text-charcoal">
                Remember my conversations on this device
              </span>
              <span className="font-sans text-[11px] leading-relaxed text-charcoal/60">
                Saved only in this browser so Remi can pick up where you left off. Avoid this on a
                shared or public computer.
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPrivacyDismissed(true)}
              className="rounded-lg border border-stone bg-card px-3 py-1.5 font-sans text-xs font-medium text-deep-teal transition-colors hover:border-deep-teal/40"
            >
              Got it
            </button>
            {hasConversation && (
              <button
                type="button"
                onClick={clearChat}
                className="flex items-center gap-1.5 rounded-lg border border-stone bg-card px-3 py-1.5 font-sans text-xs font-medium text-charcoal/70 transition-colors hover:border-deep-teal/40 hover:text-deep-teal"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Clear conversation
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )

  const safetyNote = safetyCollapsed ? (
    // Collapsed: a single quiet line that still surfaces the crisis link and can reopen the full note.
    <div
      className={cn(
        'flex items-center gap-2.5 border-stone bg-card',
        isPanel ? 'shrink-0 border-t px-5 py-2.5' : 'rounded-xl border px-4 py-2.5',
      )}
    >
      <LifeBuoy className="size-4 shrink-0 text-deep-teal" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setSafetyCollapsed(false)}
        className="font-sans text-xs leading-relaxed text-charcoal/65 underline underline-offset-2 transition-colors hover:text-deep-teal"
      >
        If you&apos;re in immediate danger
      </button>
    </div>
  ) : (
    <div
      className={cn(
        'flex items-start gap-2.5 border-stone bg-card',
        isPanel ? 'shrink-0 border-t px-5 py-3' : 'rounded-xl border px-4 py-3',
      )}
    >
      <LifeBuoy className="mt-0.5 size-4 shrink-0 text-deep-teal" aria-hidden="true" />
      <p className="flex-1 font-sans text-xs leading-relaxed text-charcoal/65">
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
      <button
        type="button"
        onClick={() => setSafetyCollapsed(true)}
        className="-mr-1 -mt-0.5 flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-sans text-xs font-medium text-charcoal/55 transition-colors hover:bg-paper hover:text-charcoal/80"
        aria-label="Collapse safety notice"
      >
        <X className="size-3.5" aria-hidden="true" />
        Close
      </button>
    </div>
  )

  return (
    <div
      className={cn(
        isPanel
          ? 'flex h-full min-h-0 flex-col pb-[env(safe-area-inset-bottom)]'
          : 'flex flex-col gap-4',
      )}
    >
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
                  {intro ?? (
                    <>
                      Hi, I&apos;m Remi. I&apos;m here to talk things through with you — a hard
                      moment with your child, or something you&apos;re carrying yourself. Share
                      whatever&apos;s on your mind.{' '}
                      <span className="text-charcoal/60">
                        (Chat is private — however please avoid full names and identifying details.)
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            const isLastUser =
              isUser && !messages.slice(index + 1).some((m) => m.role === 'user')
            // The plain-text content of this message, used for copy / listen / share.
            const messageText = message.parts
              .filter((p) => p.type === 'text')
              .map((p) => (p as { text: string }).text)
              .join('')
              .trim()
            // Resources this particular reply cited, shown inline directly beneath the
            // answer so members can simply scroll down to the answer and tap an article —
            // no separate panel to hunt for.
            const messageResources: RemiResource[] = []
            const seenForMessage = new Set<number>()
            for (const part of message.parts) {
              if (part.type === 'tool-citeResources' && part.state === 'output-available') {
                const output = part.output as { resources: RemiResource[] }
                for (const r of output.resources ?? []) {
                  if (!seenForMessage.has(r.id)) {
                    seenForMessage.add(r.id)
                    messageResources.push(r)
                  }
                }
              }
            }
            // Only show the action row on Remi's finished replies that have text — never on
            // the member's own messages, and not while the reply is still streaming in.
            const showActions =
              !isUser && messageText.length > 0 && !(busy && index === messages.length - 1)
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
                <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
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
                            className={`whitespace-pre-wrap break-words font-serif text-[15px] leading-relaxed ${
                              isUser ? 'text-off-white' : 'text-charcoal/85'
                            }`}
                          >
                            {part.text}
                          </p>
                        )
                      }
                      // Files the member attached: show images inline, other files (PDFs)
                      // as a labelled chip. Nothing is stored — this is just a render of
                      // what was sent with the message.
                      if (part.type === 'file') {
                        const filePart = part as {
                          mediaType: string
                          url: string
                          filename?: string
                        }
                        if (isImageType(filePart.mediaType)) {
                          return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={i}
                              src={filePart.url || '/placeholder.svg'}
                              alt={filePart.filename ?? 'Attached image'}
                              className="mt-1 max-h-64 w-auto max-w-full rounded-lg border border-stone/60"
                            />
                          )
                        }
                        return (
                          <span
                            key={i}
                            className={`mt-1 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-sans text-xs ${
                              isUser
                                ? 'bg-off-white/15 text-off-white'
                                : 'bg-paper text-charcoal/75'
                            }`}
                          >
                            <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="max-w-[180px] truncate">
                              {filePart.filename ?? 'Attachment'}
                            </span>
                          </span>
                        )
                      }
                      // Cited resources are collected and shown below the dialogue,
                      // not inline in the conversation bubbles.
                      return null
                    })}
                  </div>
                  {showActions && (
                    <MessageActions
                      text={messageText}
                      speechSupported={speechSupported}
                      isSpeaking={speakingId === message.id}
                      onToggleSpeak={() => speak(message.id, messageText)}
                    />
                  )}
                  {!isUser && messageResources.length > 0 && (
                    <div className="mt-2 w-full">
                      <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
                        {messageResources.length} resource
                        {messageResources.length > 1 ? 's' : ''} Remi shared
                      </p>
                      <ResourceCards resources={messageResources} onOpen={setOpenResource} />
                    </div>
                  )}
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

        {/* Conversation-length guardrail: gentle heads-up before a very long thread risks
            crowding the model's memory of earlier details. */}
        {showLengthNotice && (
          <div className="flex items-start gap-2.5 border-t border-amber/40 bg-amber/10 px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
            <p className="flex-1 font-sans text-xs leading-relaxed text-charcoal/75">
              This conversation is getting long. Remi may start to lose track of the earliest
              details. For the sharpest help, consider asking Remi for a quick summary, then{' '}
              <button
                type="button"
                onClick={() => {
                  clearChat()
                  setLengthNoticeDismissed(false)
                }}
                className="font-semibold text-deep-teal underline underline-offset-2 hover:text-teal-mid"
              >
                start a fresh chat
              </button>
              .
            </p>
            <button
              type="button"
              onClick={() => setLengthNoticeDismissed(true)}
              className="-mr-1 -mt-0.5 flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-sans text-xs font-medium text-charcoal/55 transition-colors hover:bg-paper hover:text-charcoal/80"
              aria-label="Dismiss length notice"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={onSubmit} className="shrink-0 border-t border-stone bg-card px-4 py-3">
          {/* Pending attachments queued for the next message (held in memory only). */}
          {attachments.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-2">
              {attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded-lg border border-stone bg-off-white py-1 pl-1 pr-1.5"
                >
                  {isImageType(a.mediaType) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.url || '/placeholder.svg'}
                      alt=""
                      className="size-8 rounded object-cover"
                    />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded bg-paper">
                      <FileText className="size-4 text-sage-deep" aria-hidden="true" />
                    </span>
                  )}
                  <span className="max-w-[120px] truncate font-sans text-xs text-charcoal/75">
                    {a.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(a.id)}
                    className="flex size-5 shrink-0 items-center justify-center rounded-full text-charcoal/50 transition-colors hover:bg-stone/60 hover:text-charcoal"
                    aria-label={`Remove ${a.name}`}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {attachError && (
            <p className="mb-2 font-sans text-xs text-amber" role="alert">
              {attachError}
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            multiple
            className="sr-only"
            onChange={(e) => {
              void handleFilesSelected(e.target.files)
              e.target.value = ''
            }}
          />
          <div className="flex items-end gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy || attachments.length >= MAX_FILES_PER_MESSAGE}
              aria-label="Attach a photo or PDF"
              className="size-11 shrink-0 rounded-xl border-stone text-charcoal/70 hover:text-deep-teal"
            >
              <Paperclip className="size-5" aria-hidden="true" />
            </Button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit(input)
                }
              }}
              rows={1}
              cols={1}
              placeholder="Ask Remi…"
              aria-label="Ask Remi"
              className="max-h-52 min-h-[2.75rem] w-full min-w-0 flex-1 resize-none rounded-xl border border-stone bg-off-white px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/45 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
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
              disabled={busy || (!input.trim() && attachments.length === 0)}
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

        {/* In the slide-over panel, safety + privacy stay attached to the chat card.
            Cited resources now render inline beneath each answer, so there's no separate
            resource strip crowding the bottom of the small mobile panel. */}
        {isPanel && safetyNote}
        {isPanel && privacyNote}
      </div>

      {/* On the page, resources + safety sit below the dialogue. */}
      {!isPanel && resourcesPanel}
      {!isPanel && safetyNote}
      {!isPanel && privacyNote}

      {/* In-chat reader: opens a cited resource on top of the conversation so
          closing it returns the member right back to where they were. */}
      <RemiResourceReader
        lessonId={openResource?.id ?? null}
        fallbackTitle={openResource?.title}
        onClose={() => setOpenResource(null)}
      />
    </div>
  )
}
