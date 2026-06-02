'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

const inputClass =
  'w-full rounded-lg border border-stone bg-card px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20'

const labelClass = 'font-sans text-sm font-semibold text-charcoal'

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPending(true)
    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe: remember,
    })
    if (error) {
      setPending(false)
      if (error.status === 403) {
        setError(
          'Please verify your email address first. Check your inbox for the verification link.',
        )
      } else {
        setError(error.message || 'Incorrect email or password. Please try again.')
      }
      return
    }
    // Send admins straight to the dashboard; everyone else to the library.
    const { data: session } = await authClient.getSession()
    const role = (session?.user as { role?: string } | undefined)?.role
    router.push(role === 'admin' ? '/admin' : '/library')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2" suppressHydrationWarning>
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
      <div className="flex flex-col gap-2" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <Link
            href="/forgot-password"
            className="font-sans text-xs font-semibold text-deep-teal hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="••••••••"
        />
      </div>

      <label className="flex items-center gap-2 font-sans text-sm text-charcoal/80">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="size-4 rounded border-stone text-deep-teal focus:ring-deep-teal/30"
        />
        Keep me signed in
      </label>

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
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}
