'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Check, KeyRound, Loader2, MessageCircle } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRemiStore } from '@/components/library/remi-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const inputClass =
  'w-full rounded-lg border border-stone bg-card px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20'
const labelClass = 'font-sans text-sm font-semibold text-charcoal'

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-stone bg-card p-6 sm:p-7">
      {children}
    </section>
  )
}

export function AccountSettings({ name, email }: { name: string; email: string }) {
  const router = useRouter()
  const { remember, setRemember, clearChat } = useRemiStore()

  // Profile name editing
  const [displayName, setDisplayName] = useState(name)
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [cleared, setCleared] = useState(false)

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    setNameError('')
    setNameSaved(false)
    const trimmed = displayName.trim()
    if (trimmed.length < 1) {
      setNameError('Please enter a name.')
      return
    }
    setSavingName(true)
    const { error } = await authClient.updateUser({ name: trimmed })
    setSavingName(false)
    if (error) {
      setNameError(error.message || 'Could not save your name. Please try again.')
      return
    }
    setNameSaved(true)
    router.refresh()
    setTimeout(() => setNameSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile */}
      <Card>
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-xl font-semibold text-deep-teal">Profile</h2>
          <p className="font-sans text-sm leading-relaxed text-charcoal/65">
            This is how your name appears across the library.
          </p>
        </div>
        <form onSubmit={saveName} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="displayName" className={labelClass}>
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              className={cn(inputClass, 'cursor-not-allowed bg-off-white text-charcoal/60')}
            />
            <p className="font-sans text-xs leading-relaxed text-charcoal/55">
              Need to change your email? Contact us at{' '}
              <a
                href="mailto:hello@tunedininstitute.org"
                className="font-medium text-deep-teal underline-offset-2 hover:underline"
              >
                hello@tunedininstitute.org
              </a>
              .
            </p>
          </div>

          {nameError && (
            <p className="flex items-start gap-2 font-sans text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {nameError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={savingName || displayName.trim() === name}
              className="font-sans font-semibold"
            >
              {savingName ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
            {nameSaved && (
              <span className="flex items-center gap-1.5 font-sans text-sm font-medium text-sage-deep">
                <Check className="size-4" aria-hidden="true" />
                Saved 🤍
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Remi conversations */}
      <Card>
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-deep-teal">
            <MessageCircle className="size-5" aria-hidden="true" />
            Remi conversations
          </h2>
          <p className="font-sans text-sm leading-relaxed text-charcoal/65">
            Choose whether Remi remembers your chats between visits.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-stone bg-off-white p-4">
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
          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-sm font-semibold text-charcoal">
              Remember my conversations on this device
            </span>
            <span className="font-sans text-xs leading-relaxed text-charcoal/60">
              Saved only in this browser so Remi can pick up where you left off. Nothing is sent to
              or stored by us. Avoid this on a shared or public computer.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              clearChat()
              setCleared(true)
              setTimeout(() => setCleared(false), 2500)
            }}
            className="border-stone bg-transparent font-sans font-semibold text-charcoal/80"
          >
            Clear my current conversation
          </Button>
          {cleared && (
            <span className="flex items-center gap-1.5 font-sans text-sm font-medium text-sage-deep">
              <Check className="size-4" aria-hidden="true" />
              Cleared
            </span>
          )}
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-deep-teal">
            <KeyRound className="size-5" aria-hidden="true" />
            Security
          </h2>
          <p className="font-sans text-sm leading-relaxed text-charcoal/65">
            Update the password you use to sign in.
          </p>
        </div>
        <Button asChild variant="outline" className="self-start border-stone bg-transparent font-sans font-semibold text-deep-teal">
          <Link href="/account/password">Change password</Link>
        </Button>
      </Card>
    </div>
  )
}
