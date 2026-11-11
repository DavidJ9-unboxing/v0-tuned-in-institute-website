import { ArrowUpRight, Megaphone, Users } from 'lucide-react'
import { PSILOCYBIN_PARENT_PROGRAM_URL } from '@/lib/groups'
import { GroupInterestForm } from '@/components/library/group-interest-form'

export function MemberAnnouncements() {
  return (
    <section aria-labelledby="announcements-heading" className="mt-10 flex flex-col gap-5">
      <h2
        id="announcements-heading"
        className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-charcoal/55"
      >
        Announcements
      </h2>

      <article className="flex flex-col gap-4 rounded-2xl bg-deep-teal px-6 py-7 text-off-white sm:px-8">
        <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-teal-light">
          <Megaphone className="size-4" aria-hidden="true" />
          Now enrolling for January
        </div>
        <h3 className="font-serif text-2xl font-semibold text-balance sm:text-3xl">
          Psilocybin Parent Program
        </h3>
        <p className="max-w-2xl font-serif text-[16px] leading-relaxed text-off-white/85">
          Rooted Rhythm&apos;s Psilocybin Parent Program begins in January. Parents are welcome to
          fly in from out of state to take part. If you&apos;re interested,{' '}
          <strong className="font-semibold text-off-white">
            talk with your therapist about applying
          </strong>
          .
        </p>
        <a
          href={PSILOCYBIN_PARENT_PROGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-off-white px-4 py-2.5 font-sans text-sm font-semibold text-deep-teal hover:bg-off-white/90"
        >
          Learn about the program
          <ArrowUpRight className="size-4" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </article>

      <article
        id="groups"
        className="flex flex-col gap-6 rounded-2xl border border-stone bg-card px-6 py-7 sm:px-8 lg:flex-row lg:gap-10"
      >
        <div className="flex flex-col gap-4 lg:w-5/12">
          <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">
            <Users className="size-4" aria-hidden="true" />
            New support groups
          </div>
          <h3 className="font-serif text-2xl font-semibold text-deep-teal text-balance">
            Parenting pods and adult connection groups
          </h3>
          <p className="font-serif text-[15px] leading-relaxed text-charcoal/80">
            Sophie (our founder) and our parent coaches are starting{' '}
            <strong className="font-semibold text-charcoal">parenting pods</strong>: small support
            groups of at least 4 parents who meet for 30 to 45 minutes each week while their child
            or teen is in therapy with us. Each week you&apos;ll connect over the Tuned In material
            and get feedback on how to support your child or teen.
          </p>
          <p className="font-serif text-[15px] leading-relaxed text-charcoal/80">
            We&apos;re also starting{' '}
            <strong className="font-semibold text-charcoal">self-care and connection groups</strong>{' '}
            for adults.
          </p>
          <p className="font-serif text-[15px] leading-relaxed text-charcoal/80">
            Sign up and tell us a little about your interest and goals. We&apos;ll contact you if
            and when a group is formed.
          </p>
        </div>
        <div className="lg:flex-1">
          <GroupInterestForm />
        </div>
      </article>
    </section>
  )
}
