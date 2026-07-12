import { Sprout, Waves, Compass } from 'lucide-react'

const pillars = [
  {
    icon: Sprout,
    title: 'We treat the roots',
    body: 'Meltdowns, anxiety, and shutdowns are signals from an overwhelmed nervous system — not bad behavior. We work with the cause, not just the symptom.',
  },
  {
    icon: Waves,
    title: 'We work with the rhythm',
    body: 'Regulation is a skill that grows through steady, attuned connection. We help families find a rhythm of repair, co-regulation, and calm.',
  },
  {
    icon: Compass,
    title: 'We support the whole family',
    body: 'Sensitive kids thrive when the adults around them feel resourced too. Care here includes parents, partners, and the people who hold it all.',
  },
]

export function RrApproach() {
  return (
    <section id="approach" className="bg-rr-cream">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-rr-terracotta">
            Our approach
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-rr-navy text-balance sm:text-5xl">
            We don&apos;t treat symptoms. We support the whole person.
          </h2>
          <p className="mt-5 font-sans text-lg leading-relaxed text-rr-ink">
            Grounded in attachment science, polyvagal theory, and a deep respect for sensitivity,
            our care helps nervous systems learn what safety feels like.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="flex flex-col rounded-2xl border border-rr-line bg-rr-linen/60 p-8"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-rr-teal/10 text-rr-teal">
                <pillar.icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold text-rr-navy">
                {pillar.title}
              </h3>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-rr-ink">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
