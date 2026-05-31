import type { Metadata } from 'next'
import { Lora, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { RemiProvider } from '@/components/library/remi-launcher'
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
    'Research-backed education and support for sensitive children, teens, and adults, and the people who love them. Built by clinicians, grounded in attachment science and HSP research.',
  generator: 'v0.app',
  icons: {
    icon: '/logos/tii-logo-mark.png',
    apple: '/logos/tii-logo-mark.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} bg-background`}>
      <body className="font-serif antialiased">
        <RemiProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </RemiProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
