import type { ReactNode } from 'react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/session'
import { AccountMenu } from '@/components/library/account-menu'

const adminNav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/featured', label: 'Featured' },
  { href: '/admin/accounts', label: 'Accounts' },
  { href: '/admin/metrics', label: 'Metrics' },
]

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-serif text-lg font-semibold text-deep-teal">
              Admin
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 font-sans text-sm font-medium text-muted-foreground transition-colors hover:bg-sage-light hover:text-deep-teal"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/library"
              className="hidden font-sans text-sm font-medium text-deep-teal hover:underline sm:inline"
            >
              View library
            </Link>
            <AccountMenu name={admin.name} email={admin.email} isAdmin />
          </div>
        </div>
        <nav className="flex items-center gap-1 border-t border-border px-4 py-2 sm:hidden">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 font-sans text-sm font-medium text-muted-foreground hover:text-deep-teal"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
