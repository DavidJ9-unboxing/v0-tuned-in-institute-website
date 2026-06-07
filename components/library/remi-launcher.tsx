'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { Check, Copy, Lock, Sparkles, Trash2, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'
import { RemiChat } from '@/components/library/remi-chat'
import { RemiStoreProvider, useRemiStore } from '@/components/library/remi-store'

type RemiContextValue = {
  /** Open Remi, optionally pre-filling and auto-sending a question. */
  open: (initialQuery?: string) => void
  close: () => void
}

const RemiContext = createContext<RemiContextValue | null>(null)

/** Open Remi from anywhere inside the app (header button, links, etc.). */
export function useRemi() {
  const ctx = useContext(RemiContext)
  if (!ctx) {
    throw new Error('useRemi must be used within <RemiProvider>')
  }
  return ctx
}

// Routes where the floating launcher is redundant or out of place.
const HIDE_FAB_PREFIXES = [
  '/admin',
  '/sign-in',
  '/forgot-password',
  '/reset-password',
  '/setup',
]

export function RemiProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')
  const pathname = usePathname()

  const open = useCallback(
    (query?: string) => {
      // Guard against being used directly as an event handler (e.g. onClick={open}),
      // where the first argument would be a synthetic event rather than a string.
      const trimmed = typeof query === 'string' ? query.trim() : ''
      setInitialQuery(trimmed)
      setIsOpen(true)
      // Product analytics: every "Ask Remi" entry point (FAB, CTA buttons, links)
      // funnels through here, so this captures all opens with where it happened.
      if (posthog.__loaded) {
        posthog.capture('remi_opened', {
          from_path: pathname,
          has_prefilled_query: trimmed.length > 0,
        })
      }
    },
    [pathname],
  )
  const close = useCallback(() => setIsOpen(false), [])
  const value = useMemo(() => ({ open, close }), [open, close])

  const showFab = !HIDE_FAB_PREFIXES.some((p) => pathname.startsWith(p))

  return (
    <RemiStoreProvider>
      <RemiContext.Provider value={value}>
        {children}

        {showFab && (
        <button
          type="button"
          onClick={() => open()}
          aria-label="Ask Remi, the Tuned In Institute AI concierge"
          className="group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-deep-teal py-2.5 pl-2.5 pr-4 text-off-white shadow-[0_10px_30px_-10px_rgba(27,80,90,0.7)] transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/40 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-off-white">
            <Sparkles className="size-5 text-deep-teal" aria-hidden="true" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="font-sans text-[13px] font-semibold">Ask Remi</span>
            <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-off-white/65">
              AI concierge
            </span>
          </span>
        </button>
      )}

        <RemiPanel
          open={isOpen}
          onOpenChange={(v) => {
            setIsOpen(v)
            if (!v) setInitialQuery('')
          }}
          initialQuery={initialQuery}
        />
      </RemiContext.Provider>
    </RemiStoreProvider>
  )
}

/**
 * Drop-in button to open Remi from anywhere (CTAs, page sections, etc.).
 * Must be rendered inside <RemiProvider> (the whole app is).
 */
export function AskRemiButton({
  label = 'Ask Remi',
  size = 'lg',
  variant = 'default',
  className,
}: {
  label?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  className?: string
}) {
  const { open } = useRemi()
  return (
    <Button
      type="button"
      onClick={() => open()}
      size={size}
      variant={variant}
      className={cn('gap-2 font-sans font-semibold', className)}
    >
      <Sparkles className="size-4" aria-hidden="true" />
      {label}
    </Button>
  )
}

function RemiPanel({
  open,
  onOpenChange,
  initialQuery,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialQuery: string
}) {
  const { data: session, isPending } = useSession()
  const user = session?.user
  const { remember, setRemember, canPromptRemember, snoozeRememberPrompt, clearChat } =
    useRemiStore()
  // Whether to show the gentle "remember next time?" nudge inside the close dialog.
  const showRememberNudge = canPromptRemember && !remember

  // The close confirmation explains where the conversation goes before the panel closes.
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Once a member checks "don't show again", we skip the reminder for the rest of the session.
  const [skipConfirm, setSkipConfirm] = useState(false)
  // 'idle' | 'copied' | 'empty' | 'error' — drives the copy button's label/feedback.
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'empty' | 'error'>('idle')
  // Latest plain-text transcript, kept in a ref so copying doesn't depend on re-renders.
  const transcriptRef = useRef('')
  // Reactive flag for whether there's anything in the conversation, so the close
  // dialog can offer "forget this conversation" only when there's something to forget.
  const [hasConversation, setHasConversation] = useState(false)
  // A hidden textarea rendered *inside* the dialog. Selecting an element inside the
  // focus-trapped dialog is reliable; a textarea appended to document.body gets its
  // selection cleared by Radix's focus guard before execCommand can run.
  const copySourceRef = useRef<HTMLTextAreaElement>(null)

  // The persistent iOS bug: a `position:fixed; top:0` element aligns to the
  // *layout* viewport, which extends underneath the browser's address bar. When
  // Remi's reply grows the content, iOS re-shows the address bar and it covers
  // the top of the panel — hiding the Close button. CSS (svh/dvh) can't fully
  // fix this because it only changes height, not the top offset. So we pin the
  // panel to the *visual* viewport (the actually-visible area below the address
  // bar) and track it live as the bars expand/collapse.
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const vv = typeof window !== 'undefined' ? window.visualViewport : null
    if (!vv) return
    const sync = () => {
      const el = contentRef.current
      if (!el) return
      // `offsetTop` is how far the visible area starts from the layout-viewport
      // top (i.e. the address bar's height when shown). Push the panel down by
      // that much and size it to the visible height so the header is always in view.
      el.style.top = `${vv.offsetTop}px`
      el.style.height = `${vv.height}px`
    }
    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
    }
  }, [open])

  // While the session is resolving, hold off rendering either surface so we
  // never flash the members-only popup at someone who is actually signed in.
  if (isPending) return null

  // Non-members get a focused, centered popup asking them to sign in / request access.
  if (!user) {
    return <RemiGate open={open} onOpenChange={onOpenChange} />
  }

  // A close was requested: show the reminder first unless the member opted out.
  function requestClose() {
    if (skipConfirm) {
      onOpenChange(false)
    } else {
      setConfirmOpen(true)
    }
  }

  // Intercept the sheet's own close triggers (Esc, overlay click) so they also route
  // through the reminder.
  function handleSheetOpenChange(next: boolean) {
    if (!next) {
      requestClose()
      return
    }
    onOpenChange(true)
  }

  async function copyTranscript() {
    const text = transcriptRef.current.trim()
    console.log('[v0] copyTranscript: transcript length =', text.length)
    if (!text) {
      setCopyState('empty')
      setTimeout(() => setCopyState('idle'), 2500)
      return
    }

    // The legacy textarea-select + execCommand path is the most reliable inside an
    // iframe/preview where the async clipboard API is often blocked. We select the
    // hidden textarea that lives inside this dialog so the focus trap doesn't clear it.
    let ok = false
    const ta = copySourceRef.current
    if (ta) {
      try {
        ta.value = text
        ta.removeAttribute('hidden')
        ta.focus()
        ta.select()
        ta.setSelectionRange(0, text.length)
        ok = document.execCommand('copy')
        console.log('[v0] copyTranscript: execCommand copy result =', ok)
      } catch (err) {
        console.log('[v0] copyTranscript: execCommand threw', err)
        ok = false
      }
    }

    // If execCommand failed or is unavailable, try the modern async clipboard API.
    if (!ok) {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
          ok = true
          console.log('[v0] copyTranscript: clipboard API succeeded')
        }
      } catch (err) {
        console.log('[v0] copyTranscript: clipboard API threw', err)
        ok = false
      }
    }

    setCopyState(ok ? 'copied' : 'error')
    setTimeout(() => setCopyState('idle'), ok ? 2000 : 3500)
  }

  function confirmClose() {
    // If we showed the nudge and they didn't opt in, back off for a while.
    if (showRememberNudge) snoozeRememberPrompt()
    setConfirmOpen(false)
    onOpenChange(false)
  }

  // Discard this conversation on close. Wipes the current thread and any saved copy,
  // while leaving the member's overall "remember" preference untouched so future
  // conversations are still saved if they've opted in.
  function forgetAndClose() {
    clearChat()
    setConfirmOpen(false)
    onOpenChange(false)
  }

  // Members get the full slide-over concierge chat.
  return (
    <>
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        ref={contentRef}
        side="right"
        // Hide the faint default close (the bare `>button` child); we provide a
        // clearer, larger one in the header that's easy to tap on mobile.
        // Base positioning is top-anchored at the SMALL viewport height as a
        // fallback; on devices with `window.visualViewport` the effect above
        // overrides `top`/`height` inline to track the visible area live, which
        // is what actually keeps the header (and Close button) clear of the iOS
        // address bar when Remi's reply makes the bars reappear.
        className="top-0 bottom-auto flex h-[100svh] max-h-[100svh] w-full flex-col gap-0 p-0 sm:max-w-lg lg:max-w-xl [&>button:last-of-type]:hidden"
      >
        <SheetHeader className="flex-row items-center gap-3 border-b border-stone bg-card py-4 pl-4 pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] sm:pl-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-teal">
            <Sparkles className="size-5 text-off-white" aria-hidden="true" />
            <span className="sr-only">Remi</span>
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <SheetTitle className="font-serif text-[16px] font-semibold text-deep-teal">
              Remi
            </SheetTitle>
            <span className="truncate font-sans text-xs text-charcoal/55">
              Your Tuned In Institute AI concierge
            </span>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-stone bg-off-white px-3 py-2 font-sans text-sm font-semibold text-deep-teal transition-colors hover:border-deep-teal/40 hover:bg-sage-light focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/40"
          >
            <X className="size-4" aria-hidden="true" />
            <span>Close</span>
            <span className="sr-only">chat and return to the site</span>
          </button>
        </SheetHeader>

        <div className="min-h-0 flex-1">
          <RemiChat
            variant="panel"
            initialQuery={initialQuery}
            onTranscriptChange={(t) => {
              transcriptRef.current = t
              setHasConversation(t.trim().length > 0)
            }}
          />
        </div>
      </SheetContent>
    </Sheet>

    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent className="max-w-sm gap-0 p-0">
        <div className="flex flex-col gap-5 px-7 py-7">
          <DialogHeader className="gap-2">
            <DialogTitle className="font-serif text-xl font-semibold text-deep-teal text-balance">
              {remember ? 'Your conversation will be here next time' : 'Closing Remi'}
            </DialogTitle>
            <DialogDescription className="font-serif text-[15px] leading-relaxed text-charcoal/75">
              {remember
                ? "Because you turned on remembering, this conversation is saved on this device and will be waiting when you open Remi again. You can also copy it to keep your own copy."
                : "Your conversation stays available for the rest of this visit, but it won't be saved once you leave. To keep it, turn on remembering in the chat, or copy it somewhere safe."}
            </DialogDescription>
          </DialogHeader>

          {showRememberNudge && (
            <div className="flex flex-col gap-3 rounded-xl border border-deep-teal/25 bg-sage-light/60 p-4">
              <div className="flex flex-col gap-1">
                <p className="font-serif text-[15px] font-semibold text-deep-teal">
                  Want Remi to remember next time?
                </p>
                <p className="font-sans text-xs leading-relaxed text-charcoal/70">
                  We can keep your conversations on this device so Remi picks up where you left off.
                  Nothing is sent to us. Best avoided on shared computers.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setRemember(true)}
                  className="font-sans font-semibold"
                >
                  Remember my chats
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={snoozeRememberPrompt}
                  className="font-sans font-semibold text-charcoal/70 hover:text-charcoal"
                >
                  Not now
                </Button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={copyTranscript}
            className="flex items-center justify-center gap-2 rounded-xl border border-deep-teal/30 bg-card px-4 py-3 text-center font-sans text-sm font-semibold text-deep-teal transition-colors hover:bg-sage-light focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/40"
          >
            {copyState === 'copied' ? (
              <Check className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <Copy className="size-4 shrink-0" aria-hidden="true" />
            )}
            <span>
              {copyState === 'copied'
                ? 'Copied to clipboard'
                : copyState === 'empty'
                  ? 'Nothing to copy yet'
                  : copyState === 'error'
                    ? "Couldn't copy — select the chat and copy manually"
                    : remember
                      ? 'Copy this conversation'
                      : 'Copy this conversation to keep your own copy'}
            </span>
          </button>

          {/* Off-screen source for the execCommand copy fallback. Kept rendered (not
              display:none) so it can hold a live text selection. */}
          <textarea
            ref={copySourceRef}
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] top-0 size-px opacity-0"
          />

          <label className="flex cursor-pointer items-center gap-2.5 font-sans text-xs text-charcoal/65">
            <button
              type="button"
              role="checkbox"
              aria-checked={skipConfirm}
              onClick={() => setSkipConfirm((v) => !v)}
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                skipConfirm
                  ? 'border-deep-teal bg-deep-teal text-off-white'
                  : 'border-stone bg-off-white',
              )}
            >
              {skipConfirm && <Check className="size-3" aria-hidden="true" />}
            </button>
            <span onClick={() => setSkipConfirm((v) => !v)}>Do not show me this again</span>
          </label>

          <div className="flex flex-col gap-2.5">
            <Button
              type="button"
              size="lg"
              onClick={confirmClose}
              className="font-sans font-semibold"
            >
              {remember ? 'Close and save' : 'Close chat'}
            </Button>
            {hasConversation && (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={forgetAndClose}
                className="gap-2 border-stone bg-transparent font-sans font-semibold text-charcoal/75 hover:border-deep-teal/40 hover:bg-sage-light hover:text-deep-teal"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                {remember ? "Forget this one — don't save it" : 'Close and forget this conversation'}
              </Button>
            )}
            <Button
              type="button"
              size="lg"
              variant="ghost"
              onClick={() => {
                if (showRememberNudge) snoozeRememberPrompt()
                setConfirmOpen(false)
              }}
              className="font-sans font-semibold text-charcoal/70 hover:text-charcoal"
            >
              Keep chatting
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

function RemiGate({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0">
        <div className="flex flex-col items-center gap-5 px-7 py-8 text-center">
          <span className="relative flex size-12 items-center justify-center rounded-full bg-deep-teal/10">
            <Lock className="size-6 text-deep-teal" aria-hidden="true" />
            <Sparkles
              className="absolute -right-1 -top-1 size-5 rounded-full bg-deep-teal p-1 text-off-white"
              aria-hidden="true"
            />
          </span>
          <DialogHeader className="gap-2">
            <DialogTitle className="text-center font-serif text-xl font-semibold text-deep-teal text-balance">
              Sign in to talk with Remi
            </DialogTitle>
            <DialogDescription className="text-center font-serif text-[15px] leading-relaxed text-charcoal/75">
              Remi is our members-only AI concierge, drawing only on Tuned In Institute and Rooted
              Rhythm resources. Sign in or request access to start a conversation.
            </DialogDescription>
          </DialogHeader>
          <p className="font-sans text-xs leading-relaxed text-charcoal/55">
            Remi is an educational guide, not a therapist, and does not provide diagnosis or
            treatment. For care, she points you to a Rooted Rhythm therapist.
          </p>
          <div className="flex w-full flex-col gap-2.5">
            <Button asChild size="lg" className="font-sans font-semibold">
              <Link href="/request-access">Request Access</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-deep-teal/30 bg-transparent font-sans font-semibold text-deep-teal hover:bg-deep-teal hover:text-off-white"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
