'use client'

import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import type { VariantProps } from 'class-variance-authority'

type ButtonVariant = VariantProps<typeof buttonVariants>['variant']
type ButtonSize = VariantProps<typeof buttonVariants>['size']

/**
 * Primary access call-to-action.
 * - Signed out: "Sign In"       -> /sign-in
 * - Signed in:  "Go to Library" -> /library
 *
 * Access to the library is granted directly to Rooted Rhythm and Madrega
 * clients by their care team, so guests are pointed to sign in rather than to a
 * public request-access form.
 */
export function AccessCta({
  className,
  variant,
  size = 'lg',
  requestLabel = 'Sign In',
  libraryLabel = 'Go to Library',
  libraryClassName,
  libraryVariant,
}: {
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  requestLabel?: string
  libraryLabel?: string
  /** Optional styling overrides used only in the signed-in "Go to Library" state. */
  libraryClassName?: string
  libraryVariant?: ButtonVariant
}) {
  const { data: session } = useSession()
  const loggedIn = Boolean(session?.user)

  return (
    <Button
      asChild
      size={size}
      variant={loggedIn && libraryVariant !== undefined ? libraryVariant : variant}
      className={loggedIn && libraryClassName !== undefined ? libraryClassName : className}
    >
      <Link href={loggedIn ? '/library' : '/sign-in'}>
        {loggedIn ? libraryLabel : requestLabel}
      </Link>
    </Button>
  )
}

/**
 * Secondary "Sign In" call-to-action that disappears once the member is
 * signed in (so it doesn't sit next to a "Go to Library" button).
 */
export function SignInCta({
  className,
  variant = 'outline',
  size = 'lg',
  label = 'Sign In',
}: {
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  label?: string
}) {
  const { data: session } = useSession()
  if (session?.user) return null

  return (
    <Button asChild size={size} variant={variant} className={className}>
      <Link href="/sign-in">{label}</Link>
    </Button>
  )
}

/**
 * Membership call-to-action used on program detail pages ("What's included").
 * - Signed in (member): "Go to Library to access" -> /library
 * - Signed out:         "Become a Member" / "Join to get early access" -> /membership
 */
export function MembershipCta({ comingSoon }: { comingSoon?: boolean }) {
  const { data: session } = useSession()
  const loggedIn = Boolean(session?.user)

  const label = loggedIn
    ? 'Go to Library to access'
    : comingSoon
      ? 'Join to get early access'
      : 'Become a Member'

  return (
    <>
      <Button
        asChild
        size="lg"
        className="mt-7 w-full bg-deep-teal font-sans font-semibold text-off-white hover:bg-teal-deep"
      >
        <Link href={loggedIn ? '/library' : '/membership'}>{label}</Link>
      </Button>
      <p className="mt-3 text-center font-sans text-xs text-charcoal/55">
        {loggedIn
          ? 'Your membership unlocks all four programs.'
          : 'One membership unlocks all four programs.'}
      </p>
    </>
  )
}

/**
 * Footer site-map links.
 * - Signed out: a single "Sign In" link
 * - Signed in:  a single "Go to Library" link
 */
export function FooterAccessLinks() {
  const { data: session } = useSession()
  const loggedIn = Boolean(session?.user)
  const linkClass =
    'font-serif text-sm text-off-white/85 transition-colors hover:text-sage-light'

  return (
    <li>
      <Link href={loggedIn ? '/library' : '/sign-in'} className={linkClass}>
        {loggedIn ? 'Go to Library' : 'Sign In'}
      </Link>
    </li>
  )
}
