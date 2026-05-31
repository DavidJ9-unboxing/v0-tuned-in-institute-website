import { SectionLabel } from '@/components/site/section-label'

export function PageHero({
  label,
  title,
  intro,
  children,
}: {
  label: string
  title: string
  intro?: string
  children?: React.ReactNode
}) {
  return (
    <section className="border-b border-stone bg-paper">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-deep-teal text-balance sm:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-charcoal/85">
            {intro}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}
