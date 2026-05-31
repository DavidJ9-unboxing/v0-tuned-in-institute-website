import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function ProgramCard({
  name,
  modules,
  status,
  description,
  href,
  age,
}: {
  name: string
  modules: number
  status: string
  description: string
  href: string
  age?: string
}) {
  const comingSoon = status.toLowerCase().includes('coming')
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-stone bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(27,80,90,0.45)]"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-sage transition-transform duration-300 group-hover:scale-x-100" />
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            'font-sans text-[11px] font-medium uppercase tracking-[0.14em] ' +
            (comingSoon ? 'text-amber' : 'text-sage-deep')
          }
        >
          {status}
        </span>
        <span className="font-sans text-xs font-medium uppercase tracking-[0.12em] text-charcoal/55">
          {modules} modules
        </span>
      </div>
      <h3 className="mt-4 font-serif text-2xl font-semibold text-deep-teal">{name}</h3>
      {age && (
        <p className="mt-1.5 font-sans text-xs font-medium text-teal-mid">{age}</p>
      )}
      <p className="mt-3 flex-1 font-serif text-[15px] leading-relaxed text-charcoal/80">
        {description}
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-deep-teal">
        Explore course
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
