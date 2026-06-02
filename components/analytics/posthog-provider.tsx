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
  })
}

function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!posthogKey) return
    let url = window.origin + pathname
    const qs = searchParams?.toString()
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
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
        role: user.role ?? 'client',
      })
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
