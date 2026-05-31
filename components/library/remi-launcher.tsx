'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2, Lock, Sparkles } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'
import { RemiChat } from '@/components/library/remi-chat'

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
  '/library', // Remi already lives on the page here
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

  const open = useCallback((query?: string) => {
    // Guard against being used directly as an event handler (e.g. onClick={open}),
    // where the first argument would be a synthetic event rather than a string.
    setInitialQuery(typeof query === 'string' ? query.trim() : '')
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])
  const value = useMemo(() => ({ open, close }), [open, close])

  const showFab = !HIDE_FAB_PREFIXES.some((p) => pathname.startsWith(p))

  return (
    <RemiContext.Provider value={value}>
      {children}

      {showFab && (
        <button
          type="button"
          onClick={open}
          aria-label="Ask Remi, the Tuned In Institute AI concierge"
          className="group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-deep-teal py-2.5 pl-2.5 pr-4 text-off-white shadow-[0_10px_30px_-10px_rgba(27,80,90,0.7)] transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/40 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-off-white">
            <Image
              src="/logos/tii-logo-mark.png"
              alt=""
              width={30}
              height={30}
              className="size-7 object-contain"
            />
            <Sparkles
              className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full bg-deep-teal p-0.5 text-off-white"
              aria-hidden="true"
            />
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
      onClick={open}
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="flex-row items-center gap-3 border-b border-stone bg-card px-5 py-4">
          <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone bg-off-white">
            <Image
              src="/logos/tii-logo-mark.png"
              alt=""
              width={30}
              height={30}
              className="size-7 object-contain"
            />
            <Sparkles
              className="absolute -right-1 -top-1 size-4 rounded-full bg-deep-teal p-0.5 text-off-white"
              aria-hidden="true"
            />
          </span>
          <div className="flex flex-col">
            <SheetTitle className="font-serif text-[16px] font-semibold text-deep-teal">
              Remi
            </SheetTitle>
            <span className="font-sans text-xs text-charcoal/55">
              Your Tuned In Institute AI concierge
            </span>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1">
          {isPending ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-teal-mid" aria-hidden="true" />
            </div>
          ) : user ? (
            <RemiChat key={initialQuery || 'blank'} variant="panel" initialQuery={initialQuery} />
          ) : (
            <RemiGate />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function RemiGate() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-deep-teal/10">
        <Lock className="size-6 text-deep-teal" aria-hidden="true" />
      </span>
      <h3 className="font-serif text-xl font-semibold text-deep-teal text-balance">
        Remi is available to members
      </h3>
      <p className="max-w-xs font-serif text-[15px] leading-relaxed text-charcoal/75">
        Remi draws only on Tuned In Institute and Rooted Rhythm resources, so she&apos;s reserved for
        signed-in members. Sign in or request access to start a conversation.
      </p>
      <p className="max-w-xs font-sans text-xs leading-relaxed text-charcoal/55">
        Remi is an educational guide, not a therapist, and does not provide diagnosis or treatment.
        For care, she points you to a Rooted Rhythm therapist.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2.5">
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
  )
}
