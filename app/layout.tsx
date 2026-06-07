import type { Metadata, Viewport } from 'next'
import { Lora, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { RemiProvider } from '@/components/library/remi-launcher'
import { PostHogProvider } from '@/components/analytics/posthog-provider'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'The Tuned In Institute · Research, education and support for sensitive humans',
    template: '%s · The Tuned In Institute',
  },
  description:
    'Research-backed education and support for sensitive children, teens, and adults, and the people who love them. Built by clinicians, grounded in attachment science and nervous-system research.',
  generator: 'v0.app',
  icons: {
    icon: '/logos/tii-favicon-round.png',
    apple: '/logos/tii-favicon-round.png',
  },
}

// `viewport-fit=cover` is what makes `env(safe-area-inset-*)` resolve to real
// values on iPhones (notch / Dynamic Island / home indicator). Without it those
// insets read as 0 and the Remi panel padding has nothing to work with.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} bg-background`}>
      <body className="overflow-x-hidden font-serif antialiased">
        <PostHogProvider>
          <RemiProvider>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </RemiProvider>
        </PostHogProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {process.env.NODE_ENV === 'production' && <SpeedInsights />}
      </body>
    </html>
  )
}
