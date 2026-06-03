'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { clearMustChangePassword } from '@/app/account/actions'
import { Button } from '@/components/ui/button'

const inputClass =
  'w-full rounded-lg border border-stone bg-card px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20'

const labelClass = 'font-sans text-sm font-semibold text-charcoal'

export function ChangePasswordForm({ firstTime = false }: { firstTime?: boolean }) {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Your new password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('The new passwords do not match.')
      return
    }
    setPending(true)
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: password,
      revokeOtherSessions: true,
    })
    if (error) {
      setPending(false)
      setError(error.message || 'Could not change your password. Check your current password and try again.')
      return
    }
    // Clear the temporary-password flag so they aren't prompted again.
    await clearMustChangePassword()
    setPending(false)
    setDone(true)
    router.refresh()
  }

  if (done) {
    return (
      <div className="mt-8 flex w-full flex-col items-center gap-4 rounded-2xl border border-sage-deep/40 bg-sage-light px-8 py-10 text-center">
        <CheckCircle2 className="size-10 text-sage-deep" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold text-deep-teal">Password updated</h2>
        <p className="max-w-sm font-serif text-[15px] leading-relaxed text-charcoal/80">
          Your password has been changed. Use it the next time you sign in.
        </p>
        <Button asChild size="lg" className="font-sans font-semibold">
          <Link href="/library">Go to the library</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="current" className={labelClass}>
          {firstTime ? 'Temporary password' : 'Current password'}
        </label>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={inputClass}
          placeholder={firstTime ? 'The password from your welcome email' : 'Your current password'}
        />
      </div>
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
          placeholder="Re-enter your new password"
        />
      </div>

      {error && (
        <p className="flex items-start gap-2 font-sans text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={pending} className="font-sans font-semibold">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Updating…
            </>
          ) : (
            'Save new password'
          )}
        </Button>
        {firstTime && (
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="font-sans font-semibold text-deep-teal hover:bg-sage-light"
          >
            <Link href="/library">Change it later</Link>
          </Button>
        )}
      </div>
    </form>
  )
}
