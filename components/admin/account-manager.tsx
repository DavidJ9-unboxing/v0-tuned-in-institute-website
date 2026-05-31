'use client'

import { useActionState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createClientAccount,
  changeUserRole,
  removeUser,
  type ActionState,
} from '@/app/admin/actions'

type Account = {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
}

const initial: ActionState = { status: 'idle', message: '' }
const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20'

export function AccountManager({
  accounts,
  currentUserId,
}: {
  accounts: Account[]
  currentUserId: string
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(createClientAccount, initial)
  const formRef = useRef<HTMLFormElement>(null)
  const lastStatus = useRef(state.status)

  if (state.status === 'success' && lastStatus.current !== 'success') {
    lastStatus.current = 'success'
    formRef.current?.reset()
    router.refresh()
  } else if (state.status !== 'success') {
    lastStatus.current = state.status
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl text-deep-teal">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Name
                </label>
                <input name="name" placeholder="Jane Doe" className={inputClass} required />
              </div>
              <div>
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Temporary password
                </label>
                <input
                  name="password"
                  type="text"
                  placeholder="At least 8 characters"
                  className={inputClass}
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Role
                </label>
                <select name="role" className={inputClass} defaultValue="client">
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pending} className="font-sans font-semibold">
                {pending ? 'Creating…' : 'Create account'}
              </Button>
              {state.status !== 'idle' && (
                <span
                  className={`font-sans text-sm ${
                    state.status === 'error' ? 'text-destructive' : 'text-deep-teal'
                  }`}
                >
                  {state.message}
                </span>
              )}
            </div>
            <p className="font-sans text-xs leading-relaxed text-muted-foreground">
              The client receives a verification email to confirm their address. Share the
              temporary password with them securely; they can change it via &ldquo;forgot
              password&rdquo; anytime.
            </p>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl text-deep-teal">
            Members ({accounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border">
            {accounts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-sans text-sm font-semibold text-foreground">
                    {a.name}
                    {a.id === currentUserId && (
                      <span className="ml-2 font-normal text-muted-foreground">(you)</span>
                    )}
                  </p>
                  <p className="font-sans text-sm text-muted-foreground">{a.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-0.5 font-sans text-xs font-medium ${
                      a.emailVerified
                        ? 'bg-sage-light text-deep-teal'
                        : 'bg-amber/20 text-charcoal'
                    }`}
                  >
                    {a.emailVerified ? 'verified' : 'pending'}
                  </span>
                  <select
                    defaultValue={a.role}
                    disabled={a.id === currentUserId}
                    onChange={async (e) => {
                      await changeUserRole(a.id, e.target.value as 'admin' | 'client')
                      router.refresh()
                    }}
                    className="rounded-md border border-input bg-background px-2 py-1 font-sans text-xs text-foreground disabled:opacity-50"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                  {a.id !== currentUserId && (
                    <button
                      onClick={async () => {
                        if (confirm(`Remove ${a.email}? This deletes their account.`)) {
                          await removeUser(a.id)
                          router.refresh()
                        }
                      }}
                      className="font-sans text-xs font-medium text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
