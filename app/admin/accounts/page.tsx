import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'
import { AccountManager } from '@/components/admin/account-manager'

export const dynamic = 'force-dynamic'

export default async function AdminAccountsPage() {
  const admin = await requireAdmin()
  const accounts = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .orderBy(asc(user.createdAt))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-deep-teal">Accounts</h1>
        <p className="mt-2 max-w-2xl font-sans leading-relaxed text-muted-foreground">
          Create accounts for verified clients and manage who can access the member
          library. There is no public sign-up.
        </p>
      </div>
      <AccountManager accounts={accounts} currentUserId={admin.id} />
    </div>
  )
}
