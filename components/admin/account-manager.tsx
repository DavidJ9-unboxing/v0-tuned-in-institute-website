'use client'

import { useActionState, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createClientAccount,
  changeUserRole,
  removeUser,
  resetClientPassword,
  type ActionState,
} from '@/app/admin/actions'

type Account = {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
}

/** Best-effort last name: the final whitespace-separated token of the name. */
function lastName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (parts.length > 1 ? parts[parts.length - 1] : name).toLowerCase()
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
  const [query, setQuery] = useState('')
  const [resettingId, setResettingId] = useState<string | null>(null)

  // Sort alphabetically by last name (then first name), and filter by the
  // search term across name and email.
  const visibleAccounts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...accounts].sort((a, b) =>
      lastName(a.name).localeCompare(lastName(b.name), undefined, { sensitivity: 'base' }) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    )
    if (!q) return sorted
    return sorted.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
    )
  }, [accounts, query])

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
              <div suppressHydrationWarning>
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Name
                </label>
                <input name="name" placeholder="Jane Doe" className={inputClass} required />
              </div>
              <div suppressHydrationWarning>
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
              A temporary password is generated automatically and emailed to the member along
              with their sign-in link. They&apos;ll be prompted to choose their own password the
              first time they sign in.
            </p>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="font-serif text-xl text-deep-teal">
            Members ({accounts.length})
          </CardTitle>
          <div className="relative w-full sm:max-w-xs" suppressHydrationWarning>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search members"
              className={`${inputClass} pl-9`}
            />
          </div>
        </CardHeader>
        <CardContent>
          {visibleAccounts.length === 0 ? (
            <p className="py-6 font-sans text-sm text-muted-foreground">
              No members match &ldquo;{query}&rdquo;.
            </p>
          ) : (
          <ul className="flex flex-col divide-y divide-border">
            {visibleAccounts.map((a) => (
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
                  <button
                    disabled={resettingId === a.id}
                    onClick={async () => {
                      if (
                        confirm(
                          `Send ${a.email} a new temporary password? Their current password will stop working.`,
                        )
                      ) {
                        setResettingId(a.id)
                        const result = await resetClientPassword(a.id)
                        setResettingId(null)
                        alert(result.message)
                        router.refresh()
                      }
                    }}
                    className="font-sans text-xs font-medium text-deep-teal hover:underline disabled:opacity-50"
                  >
                    {resettingId === a.id ? 'Sending…' : 'Reset password'}
                  </button>
                  {a.id !== currentUserId && (
                    <button
                      onClick={async () => {
                        if (confirm(`Remove ${a.email}? This deletes their account.`)) {
                          const result = await removeUser(a.id)
                          if (result.status === 'error') {
                            alert(result.message)
                          }
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
