'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

const inputClass =
  'w-full rounded-lg border border-stone bg-card px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20'

const labelClass = 'font-sans text-sm font-semibold text-charcoal'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPending(true)
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })
    setPending(false)
    if (error) {
      setError(error.message || 'Something went wrong. Please try again.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="mt-8 flex w-full flex-col items-center gap-4 rounded-2xl border border-sage-deep/40 bg-sage-light px-8 py-10 text-center">
        <CheckCircle2 className="size-10 text-sage-deep" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold text-deep-teal">Check your inbox</h2>
        <p className="max-w-sm font-serif text-[15px] leading-relaxed text-charcoal/80">
          If an account exists for {email}, we&apos;ve sent a link to reset your password. The link
          expires in one hour.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      {error && (
        <p className="flex items-start gap-2 font-sans text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="mt-2 font-sans font-semibold">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          'Send reset link'
        )}
      </Button>
    </form>
  )
}
