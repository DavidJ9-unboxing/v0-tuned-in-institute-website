'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Therapy', href: '#support' },
  { label: 'Our Approach', href: '#approach' },
  { label: 'Tuned In Institute', href: '#institute' },
  { label: 'Locations', href: '#locations' },
  { label: 'Stories', href: '#stories' },
]

export function RrHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full font-sans transition-colors duration-300 ${
        scrolled ? 'border-b border-rr-line bg-rr-cream/95 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="#top" className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold tracking-tight text-rr-navy">
            Rooted
          </span>
          <span className="font-display text-2xl font-normal italic text-rr-terracotta">
            Rhythm
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-rr-ink transition-colors hover:text-rr-navy"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a
            href="#consult"
            className="inline-flex items-center rounded-full bg-rr-terracotta px-5 py-2.5 text-sm font-semibold text-rr-cream shadow-sm transition-colors hover:bg-rr-terracotta-deep"
          >
            Book a Free Consult
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-full text-rr-navy transition-colors hover:bg-rr-linen lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-rr-line bg-rr-cream lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-rr-ink transition-colors hover:bg-rr-linen hover:text-rr-navy"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#consult"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-rr-terracotta px-5 py-3 text-sm font-semibold text-rr-cream transition-colors hover:bg-rr-terracotta-deep"
            >
              Book a Free Consult
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
