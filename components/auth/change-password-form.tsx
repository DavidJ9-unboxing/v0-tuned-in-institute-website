'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { forcePasswordChange, type ChangePasswordState } from '@/app/change-password/actions'

const inputClass =
  'w-full rounded-lg border border-stone bg-card px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20'

const labelClass = 'font-sans text-sm font-semibold text-charcoal'

const initialState: ChangePasswordState = { status: 'idle', message: '' }

export function ChangePasswordForm() {
  // On success the server action redirects to /library, so we only handle errors here.
  const [state, formAction, pending] = useActionState(forcePasswordChange, initialState)
  // Client-side mismatch check for instant feedback before submitting.
  const [clientError, setClientError] = useState('')

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value
    if (newPassword.length < 8) {
      e.preventDefault()
      setClientError('Your new password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirm) {
      e.preventDefault()
      setClientError('The new passwords do not match.')
      return
    }
    setClientError('')
  }

  const error = clientError || (state.status === 'error' ? state.message : '')

  return (
    <form action={formAction} onSubmit={onSubmit} className="mt-8 flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="currentPassword" className={labelClass}>
          Temporary password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
          placeholder="The password you just signed in with"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="newPassword" className={labelClass}>
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
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

      <Button type="submit" size="lg" disabled={pending} className="mt-2 font-sans font-semibold">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Saving…
          </>
        ) : (
          'Save new password'
        )}
      </Button>
    </form>
  )
}
