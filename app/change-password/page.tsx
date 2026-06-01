import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import { ChangePasswordForm } from '@/components/auth/change-password-form'

export const metadata: Metadata = {
  title: 'Set Your Password',
  description: 'Choose a new password for your Tuned In Institute account.',
}

export default async function ChangePasswordPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  // If they've already chosen their own password, there's nothing to do here.
  if (!user.mustChangePassword) redirect('/library')

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
          Set your password
        </h1>
        <p className="mt-2 text-center font-serif text-[15px] leading-relaxed text-charcoal/70 text-pretty">
          Welcome, {user.name.split(' ')[0]}. For your security, please replace the temporary
          password with one of your own before continuing to the library.
        </p>

        <ChangePasswordForm />

        <div className="mt-6 flex w-full items-start gap-3 rounded-xl border border-deep-teal/20 bg-sage-light px-5 py-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-deep-teal" aria-hidden="true" />
          <p className="font-serif text-[14px] leading-relaxed text-charcoal/85">
            Choose something only you know. You&apos;ll use this password every time you sign in from
            now on.
          </p>
        </div>
      </div>
    </section>
  )
}
