import type { Metadata } from 'next'
import Image from 'next/image'
import { requireUser } from '@/lib/session'
import { ChangePasswordForm } from '@/components/auth/change-password-form'

export const metadata: Metadata = {
  title: 'Change Password',
  description: 'Update the password for your Tuned In Institute account.',
}

export const dynamic = 'force-dynamic'

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ first?: string }>
}) {
  // Any signed-in member can change their password.
  const user = await requireUser()
  const { first } = await searchParams
  // Treat it as a first-time prompt either via the query flag or because the
  // account is still flagged as using its temporary password.
  const firstTime = first === '1' || user.mustChangePassword

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
          {firstTime ? 'Set your own password' : 'Change your password'}
        </h1>
        <p className="mt-2 max-w-sm text-center font-serif text-[15px] leading-relaxed text-charcoal/70">
          {firstTime
            ? "You're currently using a temporary password. Choose a new one now, or do it later from your account menu."
            : 'Enter your current password and choose a new one below.'}
        </p>

        <ChangePasswordForm firstTime={firstTime} />
      </div>
    </section>
  )
}
