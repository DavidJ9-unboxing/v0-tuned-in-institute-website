'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createFirstAdmin, type SetupState } from '@/app/setup/actions'

const initial: SetupState = { status: 'idle', message: '' }
const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2.5 font-sans text-sm text-foreground outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20'

export function SetupForm() {
  const [state, formAction, pending] = useActionState(createFirstAdmin, initial)

  if (state.status === 'success') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="font-sans leading-relaxed text-foreground">{state.message}</p>
        <Button asChild className="font-sans font-semibold">
          <Link href="/sign-in">Go to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block font-sans text-sm font-medium text-foreground">Name</label>
        <input name="name" placeholder="Your name" className={inputClass} required />
      </div>
      <div>
        <label className="mb-1 block font-sans text-sm font-medium text-foreground">Email</label>
        <input name="email" type="email" placeholder="you@example.com" className={inputClass} required />
      </div>
      <div>
        <label className="mb-1 block font-sans text-sm font-medium text-foreground">Password</label>
        <input
          name="password"
          type="password"
          placeholder="At least 8 characters"
          className={inputClass}
          minLength={8}
          required
        />
      </div>
      {state.status === 'error' && (
        <p className="font-sans text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="font-sans font-semibold" size="lg">
        {pending ? 'Creating…' : 'Create admin account'}
      </Button>
    </form>
  )
}
