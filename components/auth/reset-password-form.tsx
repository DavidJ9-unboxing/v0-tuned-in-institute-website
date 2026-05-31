'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

const inputClass =
  'w-full rounded-lg border border-stone bg-card px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20'

const labelClass = 'font-sans text-sm font-semibold text-charcoal'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const errorParam = searchParams.get('error')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (errorParam || !token) {
    return (
      <div className="mt-8 flex w-full flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-8 py-10 text-center">
        <AlertCircle className="size-10 text-red-600" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold text-deep-teal">Link expired</h2>
        <p className="max-w-sm font-serif text-[15px] leading-relaxed text-charcoal/80">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button asChild size="lg" className="font-sans font-semibold">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setPending(true)
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    setPending(false)
    if (error) {
      setError(error.message || 'Something went wrong. Please request a new link.')
      return
    }
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="At least 8 characters"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className={labelClass}>
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
          placeholder="Re-enter your password"
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
            Updating…
          </>
        ) : (
          'Set new password'
        )}
      </Button>
    </form>
  )
}
