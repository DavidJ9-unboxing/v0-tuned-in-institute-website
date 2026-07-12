import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Renders a flat book-cover image as a soft 3D hardcover, matching the
 * angle/lighting used across the "Tuned In" book series so multiple books read
 * as a consistent set. Pure CSS 3D (perspective + preserve-3d); the page block
 * and spine are built from child layers so any cover art can be dropped in.
 */
export function BookCover3D({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
}) {
  // Page-stack depth in px. Kept modest so it reads as a paperback, not a tome.
  const depth = 30

  return (
    <div className={cn('[perspective:1800px]', className)}>
      <div className="group relative aspect-[2/3] w-full [transform-style:preserve-3d] [transform:rotateX(6deg)_rotateY(-26deg)] transition-transform duration-700 ease-out will-change-transform hover:[transform:rotateX(3deg)_rotateY(-15deg)]">
        {/* Right-side page block: swings back from the cover's right edge. */}
        <div
          aria-hidden
          className="absolute right-0 top-[1.5%] h-[97%] [transform-origin:right_center]"
          style={{
            width: `${depth}px`,
            transform: 'rotateY(90deg)',
            backgroundImage:
              'repeating-linear-gradient(90deg, #f4efe6 0px, #f4efe6 1px, #d8cfc0 2px, #f4efe6 3px)',
            borderRadius: '1px',
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.12)',
          }}
        />
        {/* Bottom page block: swings up from the cover's bottom edge. */}
        <div
          aria-hidden
          className="absolute bottom-0 left-[1%] w-[98%] [transform-origin:center_bottom]"
          style={{
            height: `${depth}px`,
            transform: 'rotateX(90deg)',
            backgroundImage:
              'repeating-linear-gradient(0deg, #f4efe6 0px, #f4efe6 1px, #d8cfc0 2px, #f4efe6 3px)',
            borderRadius: '1px',
          }}
        />
        {/* Front cover. */}
        <Image
          src={src || '/placeholder.svg'}
          alt={alt}
          width={900}
          height={1350}
          priority={priority}
          className="absolute inset-0 h-full w-full rounded-l-[2px] rounded-r-[3px] object-cover shadow-[0_20px_40px_rgba(27,80,90,0.28)] ring-1 ring-black/5"
        />
        {/* Spine highlight along the binding (left edge). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[7%] rounded-l-[2px]"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.06) 35%, rgba(255,255,255,0.14) 60%, rgba(0,0,0,0) 100%)',
          }}
        />
      </div>
      {/* Soft ground shadow. */}
      <div
        aria-hidden
        className="mx-auto mt-3 h-5 w-[78%] rounded-[50%] bg-deep-teal/20 blur-xl"
      />
    </div>
  )
}
