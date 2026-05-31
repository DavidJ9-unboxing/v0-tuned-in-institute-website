import Link from 'next/link'
import Image from 'next/image'
import { navLinks } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="bg-deep-teal text-off-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-3">
        <div className="space-y-5">
          <Image
            src="/logos/tii-logo-reverse.png"
            alt="The Tuned In Institute"
            width={220}
            height={150}
            className="h-auto w-44"
          />
          <p className="max-w-xs font-serif text-sm leading-relaxed text-off-white/85">
            Research, education and support for sensitive humans. The research and education arm of
            Rooted Rhythm, led by Sophie Schauermann, MSW, LCSW.
          </p>
          <a
            href="mailto:admin@tunedininstitute.org"
            className="inline-block font-sans text-sm text-off-white/90 underline decoration-sage decoration-2 underline-offset-4 hover:text-sage-light"
          >
            admin@tunedininstitute.org
          </a>
        </div>

        <div>
          <h2 className="font-sans text-[12px] font-medium uppercase tracking-[0.15em] text-sage-light">
            Site Map
          </h2>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-serif text-sm text-off-white/85 transition-colors hover:text-sage-light"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/request-access"
                className="font-serif text-sm text-off-white/85 transition-colors hover:text-sage-light"
              >
                Request Access
              </Link>
            </li>
            <li>
              <Link
                href="/sign-in"
                className="font-serif text-sm text-off-white/85 transition-colors hover:text-sage-light"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-[12px] font-medium uppercase tracking-[0.15em] text-sage-light">
            Sister Organization
          </h2>
          <p className="mt-5 max-w-xs font-serif text-sm leading-relaxed text-off-white/85">
            Rooted Rhythm Therapy provides clinical care in Dallas, Atlanta, and Colorado, and
            virtual coaching worldwide.
          </p>
          <a
            href="https://www.rootedrhythm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-sans text-sm text-off-white/90 underline decoration-sage decoration-2 underline-offset-4 hover:text-sage-light"
          >
            Visit Rooted Rhythm Therapy
          </a>
        </div>
      </div>

      <div className="border-t border-off-white/15">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <p className="font-sans text-xs text-off-white/65">
            © 2026 The Tuned In Institute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
