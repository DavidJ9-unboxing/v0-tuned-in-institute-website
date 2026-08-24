import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'
import { AUDIT_ACTIONS, recordAudit } from '@/lib/audit'
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

  // Loading this page discloses the full member list. Because Tuned In access
  // is limited to Rooted Rhythm's fee-paying clients, that list reveals who is
  // a therapy client — so the view itself is an access event worth recording,
  // not just the edits made afterwards.
  await recordAudit({
    actor: admin,
    action: AUDIT_ACTIONS.MEMBER_LIST_VIEW,
    targetType: 'member_list',
    detail: `${accounts.length} accounts disclosed`,
  })

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
