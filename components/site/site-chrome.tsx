'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Wraps the Institute's shared header/footer around normal pages, but renders a
 * "bare" shell (no Institute chrome) for the standalone Rooted Rhythm home page,
 * which ships its own header and footer.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const bare = pathname?.startsWith('/rooted-rhythm') ?? false

  if (bare) {
    return <>{children}</>
  }

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  )
}
