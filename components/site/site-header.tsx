'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { navLinks } from '@/lib/site'
import { useSession } from '@/lib/auth-client'
import { AccountMenu } from '@/components/library/account-menu'
import { useRemi } from '@/components/library/remi-launcher'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { open: openRemi } = useRemi()
  const { data: session } = useSession()
  // Session is only known on the client. Until the component mounts we treat the user as
  // signed-out so the server and initial client render match (prevents hydration mismatch).
  const user =
    mounted
      ? (session?.user as { name: string; email: string; role?: string } | undefined)
      : undefined

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-off-white transition-shadow duration-300',
        scrolled
          ? 'shadow-[0_1px_0_0_var(--sage),0_8px_24px_-16px_rgba(27,80,90,0.35)]'
          : 'shadow-none',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 overflow-x-clip px-4 py-1 sm:gap-4 sm:px-8 sm:py-1.5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="The Tuned In Institute, home"
        >
          <span className="relative block h-[52px] w-[164px] shrink-0 overflow-hidden sm:h-[98px] sm:w-[400px]">
            <Image
              src="/logos/tii-logo-horizontal.png"
              alt="The Tuned In Institute"
              fill
              priority
              sizes="400px"
              className="scale-[1.6] object-contain object-center"
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-4 2xl:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-sans text-[12px] font-medium uppercase tracking-[0.12em] transition-colors',
                  active ? 'text-deep-teal' : 'text-charcoal/70 hover:text-deep-teal',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={openRemi}
            variant="outline"
            size="icon"
            aria-label="Ask Remi, the AI concierge"
            className="size-10 shrink-0 border-deep-teal/30 bg-transparent font-sans font-semibold text-deep-teal hover:bg-deep-teal hover:text-off-white sm:h-11 sm:w-auto sm:gap-2 sm:px-6"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Ask Remi</span>
          </Button>
          {user ? (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden font-sans font-semibold text-deep-teal hover:bg-sage-light sm:inline-flex"
                size="lg"
              >
                <Link href="/library">Library</Link>
              </Button>
              <AccountMenu
                name={user.name}
                email={user.email}
                isAdmin={user.role === 'admin'}
              />
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden font-sans font-semibold text-deep-teal hover:bg-sage-light sm:inline-flex"
                size="lg"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                className="hidden font-sans font-semibold sm:inline-flex"
                size="lg"
              >
                <Link href="/request-access">Request Access</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-deep-teal 2xl:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-stone bg-off-white 2xl:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-5 py-3 sm:px-8" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-stone/60 py-3 font-sans text-sm font-medium uppercase tracking-[0.1em] text-charcoal/80 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#featured"
              onClick={() => setOpen(false)}
              className="border-b border-stone/60 py-3 font-sans text-sm font-medium uppercase tracking-[0.1em] text-charcoal/80"
            >
              Featured
            </Link>
            <Button
              type="button"
              onClick={() => {
                setOpen(false)
                openRemi()
              }}
              variant="outline"
              size="lg"
              className="mt-4 gap-2 border-deep-teal/30 bg-transparent font-sans font-semibold text-deep-teal"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Ask Remi
            </Button>
            {user ? (
              <Button asChild className="mt-2 font-sans font-semibold" size="lg">
                <Link href="/library" onClick={() => setOpen(false)}>
                  Go to Library
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className="mt-4 font-sans font-semibold" size="lg">
                  <Link href="/request-access" onClick={() => setOpen(false)}>
                    Request Access
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="mt-2 border-deep-teal/30 bg-transparent font-sans font-semibold text-deep-teal"
                  size="lg"
                >
                  <Link href="/sign-in" onClick={() => setOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
