const quotes = [
  {
    quote:
      'For the first time, I understand my daughter instead of just managing her. Rooted Rhythm gave us a whole new way to be a family.',
    name: 'Parent of a 7-year-old',
    location: 'Colorado',
  },
  {
    quote:
      'They saw my son as sensitive, not difficult. The tools we learned actually work — the meltdowns are shorter and the repair is faster.',
    name: 'Parent of a 10-year-old',
    location: 'Texas',
  },
  {
    quote:
      'As an adult who always felt \u201Ctoo much,\u201D therapy here helped me finally feel at home in my own nervous system.',
    name: 'Individual client',
    location: 'New Jersey',
  },
]

export function RrTestimonials() {
  return (
    <section id="stories" className="bg-rr-linen">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-rr-terracotta">
            Client stories
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-rr-navy text-balance sm:text-5xl">
            Real change, in their own words.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {quotes.map((q) => (
            <figure
              key={q.name}
              className="flex flex-col rounded-2xl border border-rr-line bg-rr-cream p-8"
            >
              <span
                className="font-display text-5xl leading-none text-rr-gold"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote className="mt-2 flex-1 font-display text-lg italic leading-relaxed text-rr-navy">
                {q.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-rr-line pt-4 font-sans text-sm">
                <span className="font-semibold text-rr-navy">{q.name}</span>
                <span className="text-rr-ink"> · {q.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
