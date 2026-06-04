import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { AccountSettings } from '@/components/account/account-settings'

export const metadata: Metadata = {
  title: 'Account settings',
  description: 'Manage your Tuned In Institute account, conversations, and password.',
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await requireUser()

  return (
    <section className="bg-off-white">
      <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-deep-teal transition-colors hover:text-deep-teal/80"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to the library
        </Link>

        <h1 className="mt-5 font-serif text-3xl font-semibold text-deep-teal sm:text-4xl">
          Account settings
        </h1>
        <p className="mt-2 max-w-prose font-serif text-[15px] leading-relaxed text-charcoal/70">
          Manage your profile, how Remi remembers your conversations, and your password.
        </p>

        <div className="mt-8">
          <AccountSettings name={user.name} email={user.email} />
        </div>
      </div>
    </section>
  )
}
