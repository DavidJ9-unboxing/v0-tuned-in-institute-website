import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireStaff, hasTherapistAccess } from '@/lib/session'
import { AccountMenu } from '@/components/library/account-menu'

export default async function TherapistLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaff()
  // First-time staff on a temporary password choose their own first.
  if (staff.mustChangePassword) redirect('/account/password?first=1')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/therapist" className="font-serif text-lg font-semibold text-deep-teal">
            Client onboarding
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/library"
              className="hidden font-sans text-sm font-medium text-deep-teal hover:underline sm:inline"
            >
              View library
            </Link>
            <AccountMenu
              name={staff.name}
              email={staff.email}
              isAdmin={staff.role === 'admin'}
              isTherapist={staff.role !== 'admin' && hasTherapistAccess(staff)}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
