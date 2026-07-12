import Link from 'next/link'

const columns = [
  {
    title: 'Care',
    links: [
      { label: 'Play Therapy', href: '#support' },
      { label: 'Parent Coaching', href: '#support' },
      { label: 'Adult Therapy', href: '#support' },
      { label: 'Families & Couples', href: '#support' },
    ],
  },
  {
    title: 'Practice',
    links: [
      { label: 'Our Approach', href: '#approach' },
      { label: 'Tuned In Institute', href: '#institute' },
      { label: 'Locations', href: '#locations' },
      { label: 'Client Stories', href: '#stories' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Book a Free Consult', href: '#consult' },
      { label: 'Contact', href: '#consult' },
      { label: 'The Tuned In Books', href: '#institute' },
    ],
  },
]

export function RrFooter() {
  return (
    <footer className="bg-rr-teal font-sans text-rr-cream/80" id="locations">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-semibold text-rr-cream">Rooted</span>
              <span className="font-display text-2xl font-normal italic text-rr-cream/80">
                Rhythm
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-rr-cream/70">
              Play therapy, parent coaching, and adult therapy for sensitive people and the families
              who love them.
            </p>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-rr-cream/55">
              Colorado · Texas · Georgia · New Jersey
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-rr-cream/55">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-rr-cream/80 transition-colors hover:text-rr-cream"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-rr-cream/15 pt-6 text-xs text-rr-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Rooted Rhythm Therapy. All rights reserved.</p>
          <p>
            The research &amp; education arm is{' '}
            <Link href="/" className="underline decoration-rr-cream/30 underline-offset-2 hover:text-rr-cream">
              The Tuned In Institute
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
