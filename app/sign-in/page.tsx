import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Lock } from 'lucide-react'
import { auth } from '@/lib/auth'
import { SignInForm } from '@/components/auth/sign-in-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to the Tuned In Institute content library. Access is reserved for Rooted Rhythm clients.',
}

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/library')

  return (
    <section className="bg-off-white">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 py-20 sm:px-8">
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-deep-teal">
          <Image
            src="/logos/tii-logo-mark.png"
            alt=""
            width={120}
            height={120}
            className="size-16 scale-[1.4] object-contain"
          />
        </div>
        <h1 className="mt-6 text-center font-serif text-3xl font-semibold text-deep-teal">
          Sign in
        </h1>
        <p className="mt-2 text-center font-serif text-[15px] leading-relaxed text-charcoal/70">
          Welcome back. Sign in to reach your content library.
        </p>

        <SignInForm />

        <div className="mt-6 flex w-full items-start gap-3 rounded-xl border border-deep-teal/20 bg-sage-light px-5 py-4">
          <Lock className="mt-0.5 size-5 shrink-0 text-deep-teal" aria-hidden="true" />
          <p className="font-serif text-[14px] leading-relaxed text-charcoal/85">
            Accounts are reserved for Rooted Rhythm clients. Not a client yet?{' '}
            <Link href="/request-access" className="font-semibold text-deep-teal underline">
              Request access
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center font-sans text-xs text-charcoal/50">
          Need help? Email admin@tunedininstitute.org.
        </p>
      </div>
    </section>
  )
}
