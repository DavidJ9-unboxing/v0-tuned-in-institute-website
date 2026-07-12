import type { Metadata } from 'next'
import { RrHeader } from '@/components/rooted-rhythm/rr-header'
import { RrHero } from '@/components/rooted-rhythm/rr-hero'
import { RrApproach } from '@/components/rooted-rhythm/rr-approach'
import { RrSupport } from '@/components/rooted-rhythm/rr-support'
import { RrInstitute } from '@/components/rooted-rhythm/rr-institute'
import { RrTestimonials } from '@/components/rooted-rhythm/rr-testimonials'
import { RrCta } from '@/components/rooted-rhythm/rr-cta'
import { RrFooter } from '@/components/rooted-rhythm/rr-footer'

export const metadata: Metadata = {
  title: 'Rooted Rhythm Therapy · Play therapy & coaching for sensitive families',
  description:
    'Play therapy, parent coaching, and adult therapy for sensitive children, teens, and adults. Trusted by 2,000+ families across Colorado, Texas, Georgia, and New Jersey.',
}

export default function RootedRhythmHome() {
  return (
    <div className="min-h-screen bg-rr-cream font-sans text-rr-ink">
      <RrHeader />
      <RrHero />
      <RrApproach />
      <RrSupport />
      <RrInstitute />
      <RrTestimonials />
      <RrCta />
      <RrFooter />
    </div>
  )
}
