import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AccessCta } from '@/components/site/access-cta'

export function AccessGate({
  title = 'Members-only content',
  description = 'This content is available only to Rooted Rhythm and Madrega clients, who are granted access by their care team. Sign in if you already have an account.',
  className,
}: {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-5 rounded-2xl border border-deep-teal/20 bg-sage-light px-6 py-10 text-center sm:px-10',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-deep-teal/10">
        <Lock className="size-6 text-deep-teal" aria-hidden="true" />
      </span>
      <h3 className="font-serif text-2xl font-semibold text-deep-teal text-balance">{title}</h3>
      <p className="max-w-md font-serif text-[16px] leading-relaxed text-charcoal/80">
        {description}
      </p>
      <div className="flex justify-center">
        <AccessCta className="font-sans font-semibold" />
      </div>
    </div>
  )
}
