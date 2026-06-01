import type { Metadata } from 'next'
import { AccessCta, SignInCta } from '@/components/site/access-cta'
import { PageHero } from '@/components/site/page-hero'
import { ProgramCard } from '@/components/site/program-card'
import { programs } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Programs',
  description:
    'Four research-grounded program tracks for parents of sensitive children and teens, sensitive teens, and sensitive adults. Library access unlocks them all for Rooted Rhythm clients.',
}

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        label="The programs"
        title="Four tracks. One research foundation."
        intro="Every program translates the same body of science into age-specific tools. Each course includes video, audio, transcripts, and downloadable resources. Library access unlocks all four, past and future, for Rooted Rhythm clients."
      />

      <section className="bg-off-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {programs.map((program) => (
              <ProgramCard
                key={program.slug}
                name={program.name}
                modules={program.modules}
                status={program.status}
                description={program.description}
                age={program.age}
                href={`/programs/${program.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone bg-deep-teal text-off-white">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            Library access unlocks every program.
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-off-white/85">
            Rooted Rhythm clients get all four tracks, the full resource library, and every new
            program as it&apos;s released.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <AccessCta
              className="bg-off-white font-sans font-semibold text-deep-teal hover:bg-off-white/90"
            />
            <SignInCta
              className="border-off-white/40 bg-transparent font-sans font-semibold text-off-white hover:bg-off-white hover:text-deep-teal"
            />
          </div>
        </div>
      </section>
    </>
  )
}
