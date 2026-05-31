import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Tuned In Institute account password.',
}

export default function ForgotPasswordPage() {
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
          Forgot your password?
        </h1>
        <p className="mt-2 text-center font-serif text-[15px] leading-relaxed text-charcoal/70">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>

        <ForgotPasswordForm />

        <p className="mt-6 text-center font-sans text-sm text-charcoal/60">
          Remembered it?{' '}
          <Link href="/sign-in" className="font-semibold text-deep-teal underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
