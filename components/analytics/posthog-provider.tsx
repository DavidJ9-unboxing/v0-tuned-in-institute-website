'use client'

import { Suspense, useEffect, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useSession } from '@/lib/auth-client'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

// Initialize once, on the client, only when a key is configured. We disable the
// library's automatic pageview capture and send our own on App Router navigations
// (Next.js client-side route changes don't trigger PostHog's default capture).
if (typeof window !== 'undefined' && posthogKey && !posthog.__loaded) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: 'identified_only',
    // Session recording would capture the text of Remi conversations, which are
    // sensitive parenting/mental-health disclosures and are promised to the
    // member as private. Recording can otherwise be switched on remotely from
    // the PostHog dashboard, so we disable it in code where it can be reviewed.
    disable_session_recording: true,
    // Belt-and-braces: if recording is ever deliberately re-enabled, never
    // capture typed input or on-screen text.
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*',
    },
  })
}

// Query params that must never reach a third-party analytics vendor:
// `token` is a single-use password-reset credential, and `q` is free text the
// member typed about their own family. Lesson paths are kept, since knowing
// which resources get used is legitimate (and useful) product analytics.
const REDACTED_PARAMS = new Set(['q', 'token'])

function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!posthogKey) return
    let url = window.origin + pathname
    const safe = new URLSearchParams()
    searchParams?.forEach((value, key) => {
      safe.append(key, REDACTED_PARAMS.has(key) ? 'redacted' : value)
    })
    const qs = safe.toString()
    if (qs) url += `?${qs}`
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

function PostHogIdentify() {
  const { data: session, isPending } = useSession()
  const user = session?.user as
    | { id: string; email: string; name: string; role?: string }
    | undefined

  useEffect(() => {
    // Wait until the session has resolved so we don't reset the anonymous id mid-load.
    if (!posthogKey || isPending) return
    if (user) {
      // Deliberately no email or name. Sending those would let anyone with
      // PostHog access tie a named parent (or therapy client) to the specific
      // mental-health resources they viewed. The opaque user id still supports
      // funnels, retention and per-role analysis without identifying anyone.
      posthog.identify(user.id, { role: user.role ?? 'client' })
    } else if (posthog._isIdentified()) {
      // Was identified, now signed out: drop the identity so events aren't misattributed.
      posthog.reset()
    }
  }, [user, isPending])

  return null
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  // When no key is configured (e.g. local dev without env vars), render children
  // untouched so the app still works without analytics.
  if (!posthogKey) return <>{children}</>

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      <PostHogIdentify />
      {children}
    </PHProvider>
  )
}
