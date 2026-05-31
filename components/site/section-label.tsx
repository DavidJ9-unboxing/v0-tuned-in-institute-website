import { cn } from '@/lib/utils'

export function SectionLabel({
  children,
  center = false,
  className,
}: {
  children: React.ReactNode
  center?: boolean
  className?: string
}) {
  return (
    <p className={cn('section-label', center && 'section-label-center', className)}>{children}</p>
  )
}
