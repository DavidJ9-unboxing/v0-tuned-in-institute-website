import { sql, gte, desc, eq, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user, session } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignupsChart } from '@/components/admin/signups-chart'

export const dynamic = 'force-dynamic'

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(d: Date) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export default async function AdminMetricsPage() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS)
  const thirtyDaysAgo = startOfDay(new Date(now.getTime() - 29 * DAY_MS))

  const [
    [{ total }],
    roleRows,
    [{ banned }],
    [{ new7 }],
    [{ new30 }],
    [{ activeSessions }],
    dailyRows,
    recentSignups,
  ] = await Promise.all([
    db.select({ total: count() }).from(user),
    db
      .select({ role: user.role, value: count() })
      .from(user)
      .groupBy(user.role),
    db.select({ banned: count() }).from(user).where(eq(user.banned, true)),
    db.select({ new7: count() }).from(user).where(gte(user.createdAt, sevenDaysAgo)),
    db.select({ new30: count() }).from(user).where(gte(user.createdAt, thirtyDaysAgo)),
    db
      .select({ activeSessions: sql<number>`count(distinct ${session.userId})::int` })
      .from(session)
      .where(gte(session.expiresAt, now)),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${user.createdAt}), 'YYYY-MM-DD')`,
        value: count(),
      })
      .from(user)
      .where(gte(user.createdAt, thirtyDaysAgo))
      .groupBy(sql`date_trunc('day', ${user.createdAt})`),
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(8),
  ])

  const admins = roleRows.find((r) => r.role === 'admin')?.value ?? 0
  const clients = total - admins

  // Build a complete 30-day series, filling days with no signups as 0.
  const counts = new Map(dailyRows.map((r) => [r.day, Number(r.value)]))
  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo.getTime() + i * DAY_MS)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`
    return {
      day: key,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      signups: counts.get(key) ?? 0,
    }
  })

  const kpis = [
    { label: 'Total accounts', value: total },
    { label: 'New (7 days)', value: new7 },
    { label: 'New (30 days)', value: new30 },
    { label: 'Active sessions', value: activeSessions, hint: 'Signed in now' },
    { label: 'Admins', value: admins },
    { label: 'Clients', value: clients },
  ]

  const dateFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-deep-teal">User metrics</h1>
        <p className="mt-2 max-w-2xl font-sans leading-relaxed text-muted-foreground">
          Account growth and activity for the member library. Traffic and product analytics
          live in Vercel Analytics and PostHog.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="font-sans text-sm font-medium text-muted-foreground">
                {k.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-4xl font-semibold text-deep-teal">{k.value}</p>
              {k.hint ? (
                <p className="mt-1 font-sans text-xs text-muted-foreground">{k.hint}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl text-deep-teal">
            New accounts (last 30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {new30 > 0 ? (
            <SignupsChart data={series} />
          ) : (
            <p className="py-12 text-center font-sans text-sm text-muted-foreground">
              No new accounts in the last 30 days yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl text-deep-teal">Recent signups</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSignups.length === 0 ? (
            <p className="py-8 text-center font-sans text-sm text-muted-foreground">
              No accounts yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentSignups.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm font-medium text-foreground">
                      {u.name}
                    </p>
                    <p className="truncate font-sans text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={
                        u.role === 'admin'
                          ? 'rounded-full bg-deep-teal px-2.5 py-0.5 font-sans text-xs font-medium text-off-white'
                          : 'rounded-full bg-sage-light px-2.5 py-0.5 font-sans text-xs font-medium text-deep-teal'
                      }
                    >
                      {u.role}
                    </span>
                    <span className="font-sans text-xs text-muted-foreground">
                      {dateFmt.format(new Date(u.createdAt))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
