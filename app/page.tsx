import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/site/section-label'
import { SearchBar } from '@/components/site/search-bar'
import { ProgramCard } from '@/components/site/program-card'
import { ConciergeExchange, conciergeExamples } from '@/components/site/concierge-exchange'
import { AskRemiButton } from '@/components/library/remi-launcher'
import { Hero } from '@/components/home/hero'
import { programs, clinicalFoundations } from '@/lib/site'

const pillars = [
  {
    title: 'Research-grounded.',
    body: "Every module is rooted in neuroscience, polyvagal theory, and Dr. Elaine Aron's decades of HSP research, translated into real-life practice.",
  },
  {
    title: 'For every stage of life.',
    body: 'From toddlers to adults, age-specific education that meets sensitive humans exactly where they are.',
  },
  {
    title: 'Education plus ongoing support.',
    body: 'Courses, video content, downloadable resources, and a growing library.',
  },
  {
    title: 'Built by clinicians in the room.',
    body: 'Every piece of content was tested in living rooms during meltdowns, at bedtime, and in the quiet moments that mattered most.',
  },
]

const membershipFeatures = [
  'All 4 program tracks',
  'Video, audio and transcripts',
  'Full resource library',
  '24/7 AI Concierge (coming soon)',
]

const stats = [
  { number: '15–20%', label: 'of people are born highly sensitive' },
  { number: '12+', label: 'years of clinical practice behind every module' },
  { number: '4', label: 'program tracks: children, teens, adults' },
]

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Ask Remi, the AI concierge */}
      <section className="bg-sage-light">
        <div className="mx-auto max-w-4xl px-5 py-12 text-center sm:px-8">
          <SearchBar />
          <p className="mt-4 font-sans text-sm text-deep-teal/80">
            Meet Remi, our AI concierge. She draws on everything across the Tuned In Institute and
            Rooted Rhythm to point you to the right resources.
          </p>
          <p className="mx-auto mt-2 max-w-xl font-sans text-xs leading-relaxed text-charcoal/55">
            Remi is an educational guide, not a therapist — she doesn&apos;t diagnose or provide
            treatment. For clinical care, she&apos;ll help you connect with a Rooted Rhythm therapist.
          </p>
        </div>
      </section>

      {/* Editorial statement */}
      <section className="bg-off-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h2 className="font-serif text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-deep-teal text-balance sm:text-5xl">
              You were never{' '}
              <span className="italic underline decoration-sage decoration-4 underline-offset-[6px]">
                too much.
              </span>{' '}
              You were just in the wrong environment.
            </h2>
            <p className="mt-6 max-w-xl font-serif text-lg italic leading-relaxed text-charcoal/80">
              Research-backed education and support for sensitive children, teens, and adults, and
              the people who love them.
            </p>
            <p className="mt-8 font-serif text-base font-medium text-charcoal/70">
              <span className="font-semibold text-deep-teal">15–20%</span> of people are born highly
              sensitive.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-stone">
            <Image
              src="/images/supportive-conversation-v5.png"
              alt="Two women in a quiet, attentive conversation over tea at a sunlit kitchen table"
              width={720}
              height={820}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why we exist */}
      <section className="bg-sage-light">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 md:py-24">
          <SectionLabel>Why we exist</SectionLabel>
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Sensitivity is not a flaw. It&apos;s a different operating system.
          </h2>
          <p className="mt-6 font-serif text-lg leading-relaxed text-charcoal/85">
            About fifteen to twenty percent of people are born highly sensitive, wired to notice
            more, process more deeply, and feel more intensely. The problem is not the sensitivity.
            It is the lack of understanding around it.
          </p>
          <Link
            href="/what-is-sensitivity"
            className="mt-6 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-deep-teal underline decoration-sage decoration-2 underline-offset-4 hover:text-teal-mid"
          >
            Learn about sensitivity <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Four pillars */}
      <section className="border-y border-stone bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.title}>
                <span className="block h-1 w-10 bg-sage" />
                <h3 className="mt-5 font-serif text-xl font-semibold text-deep-teal">{p.title}</h3>
                <p className="mt-3 font-serif text-[15px] leading-relaxed text-charcoal/80">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four program tracks */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <SectionLabel>The programs</SectionLabel>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Four program tracks. One research foundation.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {programs.map((program) => (
              <ProgramCard
                key={program.slug}
                name={program.name}
                modules={program.modules}
                status={program.status}
                description={program.description}
                href={`/programs/${program.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* The book */}
      <section className="border-y border-stone bg-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <Image
              src="/images/tuned-in-book.webp"
              alt="Tuned In: A Guide for Parents of Sensitive Children by Sophie Schauermann, LCSW"
              width={800}
              height={1000}
              className="mx-auto h-auto w-full max-w-sm object-contain drop-shadow-[0_24px_40px_rgba(27,80,90,0.25)]"
            />
          </div>
          <div className="order-1 md:order-2">
            <SectionLabel>Now available</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
              The book that started everything.
            </h2>
            <p className="mt-6 font-serif text-lg leading-relaxed text-charcoal/85">
              <em>Tuned In: A Guide for Parents of Sensitive Children</em> by Sophie Schauermann,
              MSW, LCSW. The research-backed foundation behind every program at the Institute.
              Available now in paperback and on Kindle.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-deep-teal font-sans font-semibold text-deep-teal hover:bg-deep-teal hover:text-off-white"
              >
                <a href="https://www.amazon.com/dp/B0FFZ8N7N6" target="_blank" rel="noopener noreferrer">
                  Buy Paperback on Amazon
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-deep-teal font-sans font-semibold text-deep-teal hover:bg-deep-teal hover:text-off-white"
              >
                <a href="https://www.amazon.com/dp/B0FFNGD6VH" target="_blank" rel="noopener noreferrer">
                  Buy on Kindle
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Membership unlock band */}
      <section className="bg-deep-teal text-off-white">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 md:py-24">
          <p className="section-label section-label-center !text-sage-light">One membership</p>
          <h2 className="mx-auto mt-6 max-w-2xl font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            Rooted Rhythm clients unlock the full Tuned In library.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-off-white/85">
            All courses, all resources, all new content, past and future, in one place. Created by
            the licensed therapists at Rooted Rhythm and available to their clients.
          </p>
          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {membershipFeatures.map((f) => (
              <li key={f} className="font-sans text-sm text-off-white/90">
                {f}
              </li>
            ))}
          </ul>
          <Button
            asChild
            size="lg"
            className="mt-10 bg-off-white font-sans font-semibold text-deep-teal hover:bg-off-white/90"
          >
            <Link href="/request-access">Request Access</Link>
          </Button>
        </div>
      </section>

      {/* AI Concierge preview */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 md:py-24">
          <SectionLabel center>Meet Remi</SectionLabel>
          <h2 className="mt-5 text-center font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            24/7 AI Concierge. Personal answers, anytime.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center font-serif text-lg leading-relaxed text-charcoal/85">
            Parenting a sensitive child at 11pm and hit a wall? Remi is there, trained on every
            module, every resource, and every principle in our curriculum.
          </p>
          <div className="mt-12">
            <ConciergeExchange
              question={conciergeExamples[0].question}
              answer={conciergeExamples[0].answer}
            />
          </div>
          <div className="mt-8 flex justify-center">
            <AskRemiButton label="Ask Remi" />
          </div>
          <p className="mt-8 text-center font-sans text-sm text-charcoal/60">
            Available 24/7 · Trained on Tuned In curriculum · Personalized to your child&apos;s age
          </p>
        </div>
      </section>

      {/* Founder story */}
      <section className="border-y border-stone bg-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2">
          <div>
            <SectionLabel>Our story</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
              Born from a decade of families who felt unseen.
            </h2>
            <p className="mt-6 font-serif text-lg leading-relaxed text-charcoal/85">
              After twelve years sitting with parents who felt confused, overwhelmed, and sometimes
              defeated by their child&apos;s intensity, our founder saw a pattern: the children
              weren&apos;t broken. The understanding around them was.
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-charcoal/85">
              The Institute is where that clinical experience becomes a curriculum, so the next
              parent does not have to start from scratch at the hardest moment of the day.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-deep-teal underline decoration-sage decoration-2 underline-offset-4 hover:text-teal-mid"
            >
              Read our story <ArrowRight className="size-4" />
            </Link>
          </div>
          <figure className="overflow-hidden rounded-xl border border-stone shadow-[0_24px_50px_-30px_rgba(27,80,90,0.6)]">
            <Image
              src="/images/parent-child-moment-v5.png"
              alt="A parent crouched down sharing a tender, attentive moment with their young child in soft natural light"
              width={720}
              height={900}
              className="aspect-[4/5] h-auto w-full object-cover"
            />
          </figure>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-off-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-5xl font-semibold text-deep-teal">{s.number}</p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-charcoal/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical approach */}
      <section className="bg-deep-teal text-off-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <p className="section-label !text-sage-light">Our clinical approach</p>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            The science of sensitivity, made practical.
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {clinicalFoundations.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-off-white/15 bg-teal-deep/40 p-6"
              >
                <span className="block h-1 w-8 bg-sage" />
                <h3 className="mt-4 font-serif text-lg font-semibold leading-snug">{f.title}</h3>
                <p className="mt-3 font-serif text-sm leading-relaxed text-off-white/80">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooted Rhythm partnership */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <SectionLabel>In-person care</SectionLabel>
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-deep-teal text-balance sm:text-4xl">
            Therapy in Dallas, Atlanta and Colorado.
          </h2>
          <p className="mt-6 font-serif text-lg leading-relaxed text-charcoal/85">
            The Tuned In Institute partners with Rooted Rhythm Therapy, a network of clinicians
            specializing in sensitive children, teens, and adults. Our educational content and their
            clinical care are designed to work together. When you need real support from a licensed
            professional, you can set up a consultation with a Rooted Rhythm therapist.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="font-sans font-semibold">
              <a
                href="https://www.rootedrhythm.com/contactus"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a consultation
              </a>
            </Button>
            <a
              href="https://www.rootedrhythm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-deep-teal underline decoration-sage decoration-2 underline-offset-4 hover:text-teal-mid"
            >
              Visit Rooted Rhythm Therapy <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
