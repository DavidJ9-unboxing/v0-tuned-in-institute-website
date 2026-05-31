import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Choose a new password for your Tuned In Institute account.',
}

export default function ResetPasswordPage() {
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
          Choose a new password
        </h1>
        <p className="mt-2 text-center font-serif text-[15px] leading-relaxed text-charcoal/70">
          Enter a new password for your account below.
        </p>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </section>
  )
}
