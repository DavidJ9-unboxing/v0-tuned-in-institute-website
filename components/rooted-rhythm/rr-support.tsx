import { Blocks, Sparkles, HeartHandshake, UserRound, Users } from 'lucide-react'

const audiences = [
  {
    icon: Blocks,
    title: 'Children',
    age: 'Ages 2–12',
    body: 'Play therapy that helps big feelings, sensory overwhelm, and transitions become more manageable — in a language kids understand.',
  },
  {
    icon: Sparkles,
    title: 'Teens',
    age: 'Ages 13–18',
    body: 'A steady, judgment-free space to navigate anxiety, identity, friendships, and the intensity of a finely tuned nervous system.',
  },
  {
    icon: HeartHandshake,
    title: 'Parents & Caregivers',
    age: 'Coaching',
    body: 'Practical, compassionate coaching so you can respond to hard moments with confidence instead of second-guessing yourself.',
  },
  {
    icon: UserRound,
    title: 'Adults',
    age: 'Individual therapy',
    body: 'For the sensitive adult who feels everything deeply. Understand your wiring and build tools for regulation, boundaries, and self-trust.',
  },
  {
    icon: Users,
    title: 'Families & Couples',
    age: 'Relational care',
    body: 'Rebuild connection, communication, and repair when sensitivity and stress have strained the people you love most.',
  },
]

export function RrSupport() {
  return (
    <section id="support" className="bg-rr-linen">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-rr-terracotta">
            Find your fit
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-rr-navy text-balance sm:text-5xl">
            Care for every season of a sensitive life.
          </h2>
          <p className="mt-5 font-sans text-lg leading-relaxed text-rr-ink">
            Whether you&apos;re raising a spirited toddler or reconnecting with yourself as an adult,
            there&apos;s a place for you here.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="group flex flex-col rounded-2xl border border-rr-line bg-rr-cream p-7 transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(51,65,90,0.45)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-full bg-rr-terracotta/12 text-rr-terracotta">
                  <a.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-rr-gold">
                  {a.age}
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold text-rr-navy">{a.title}</h3>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-rr-ink">{a.body}</p>
            </div>
          ))}

          <div className="flex flex-col justify-center rounded-2xl bg-rr-navy p-7 text-rr-cream">
            <h3 className="font-display text-2xl font-semibold">Not sure where to start?</h3>
            <p className="mt-3 font-sans text-[15px] leading-relaxed text-rr-cream/80">
              Book a free 15-minute consult and we&apos;ll help you find the right fit.
            </p>
            <a
              href="#consult"
              className="mt-6 inline-flex w-fit items-center justify-center rounded-full bg-rr-terracotta px-6 py-3 font-sans text-sm font-semibold text-rr-cream transition-colors hover:bg-rr-terracotta-deep"
            >
              Book a Free Consult
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
