import { sql, gte, lt, and, desc, eq, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user, session } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeseriesChart } from '@/components/admin/timeseries-chart'
import { MetricsRangePicker } from '@/components/admin/metrics-range-picker'
import { resolveRange, buildBuckets, bucketFormat } from '@/lib/admin-metrics'

export const dynamic = 'force-dynamic'

export default async function AdminMetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const sp = await searchParams
  const range = resolveRange(sp)
  const gran = range.granularity
  const fmt = bucketFormat(gran)
  const now = new Date()

  // Bucketed (gap-filled on the JS side) time-series expressions. `gran` and
  // `fmt` come from a fixed, validated set, but are still bound as parameters.
  const sessionBucket = sql<string>`to_char(date_trunc(${gran}, ${session.createdAt}), ${fmt})`
  const signupBucket = sql<string>`to_char(date_trunc(${gran}, ${user.createdAt}), ${fmt})`

  const inSessionRange = and(
    gte(session.createdAt, range.start),
    lt(session.createdAt, range.end),
  )
  const inUserRange = and(gte(user.createdAt, range.start), lt(user.createdAt, range.end))

  const [
    [{ sessionsTotal }],
    [{ activeMembers }],
    [{ newInPeriod }],
    sessionRows,
    signupRows,
    [{ totalAccounts }],
    roleRows,
    [{ banned }],
    [{ activeNow }],
    recentSignups,
  ] = await Promise.all([
    // --- Period-scoped --------------------------------------------------
    db.select({ sessionsTotal: count() }).from(session).where(inSessionRange),
    db
      .select({ activeMembers: sql<number>`count(distinct ${session.userId})::int` })
      .from(session)
      .where(inSessionRange),
    db.select({ newInPeriod: count() }).from(user).where(inUserRange),
    db
      .select({ bucket: sessionBucket, value: count() })
      .from(session)
      .where(inSessionRange)
      // Group by the selected bucket's ordinal position so it always matches the
      // exact SELECT expression (Drizzle qualifies the column differently between
      // SELECT and GROUP BY, which Postgres rejects otherwise).
      .groupBy(sql`1`),
    db
      .select({ bucket: signupBucket, value: count() })
      .from(user)
      .where(inUserRange)
      .groupBy(sql`1`),
    // --- All-time snapshot ----------------------------------------------
    db.select({ totalAccounts: count() }).from(user),
    db.select({ role: user.role, value: count() }).from(user).groupBy(user.role),
    db.select({ banned: count() }).from(user).where(eq(user.banned, true)),
    db
      .select({ activeNow: sql<number>`count(distinct ${session.userId})::int` })
      .from(session)
      .where(gte(session.expiresAt, now)),
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
  const clients = totalAccounts - admins

  // Map DB rows onto the complete bucket list so empty intervals render as 0.
  const buckets = buildBuckets(range.start, range.end, gran)
  const sessionMap = new Map(sessionRows.map((r) => [r.bucket, Number(r.value)]))
  const signupMap = new Map(signupRows.map((r) => [r.bucket, Number(r.value)]))
  const sessionSeries = buckets.map((b) => ({ label: b.label, value: sessionMap.get(b.key) ?? 0 }))
  const signupSeries = buckets.map((b) => ({ label: b.label, value: signupMap.get(b.key) ?? 0 }))

  const avgPerDay = sessionsTotal / range.days
  const avgPerDayLabel =
    range.days <= 1 || sessionsTotal === 0
      ? String(sessionsTotal)
      : avgPerDay.toFixed(avgPerDay >= 10 ? 0 : 1)

  const periodKpis = [
    { label: 'Sessions', value: sessionsTotal, hint: 'Sign-ins in period' },
    { label: 'Active members', value: activeMembers, hint: 'Distinct members' },
    { label: 'New accounts', value: newInPeriod, hint: 'Created in period' },
    { label: 'Avg sessions / day', value: avgPerDayLabel },
  ]

  const snapshotKpis = [
    { label: 'Total accounts', value: totalAccounts },
    { label: 'Clients', value: clients },
    { label: 'Admins', value: admins },
    { label: 'Signed in now', value: activeNow },
    { label: 'Banned', value: banned },
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
          Member sessions and account growth for the library. Pick a time period to update the
          charts and totals below. Traffic and product analytics live in Vercel Analytics and
          PostHog.
        </p>
      </div>

      <MetricsRangePicker range={range.key} from={range.fromParam} to={range.toParam} />

      {/* Period-scoped KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {periodKpis.map((k) => (
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

      {/* Sessions over time */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl text-deep-teal">
            Sessions over time
            <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">
              {range.label}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsTotal > 0 ? (
            <TimeseriesChart data={sessionSeries} seriesLabel="Sessions" variant="area" />
          ) : (
            <p className="py-12 text-center font-sans text-sm text-muted-foreground">
              No sessions recorded in this period.
            </p>
          )}
        </CardContent>
      </Card>

      {/* New accounts over time */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl text-deep-teal">
            New accounts over time
            <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">
              {range.label}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {newInPeriod > 0 ? (
            <TimeseriesChart
              data={signupSeries}
              seriesLabel="New accounts"
              color="var(--color-sage-deep)"
              variant="bar"
            />
          ) : (
            <p className="py-12 text-center font-sans text-sm text-muted-foreground">
              No new accounts in this period.
            </p>
          )}
        </CardContent>
      </Card>

      {/* All-time snapshot */}
      <div>
        <h2 className="mb-3 font-serif text-lg font-semibold text-deep-teal">All-time snapshot</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {snapshotKpis.map((k) => (
            <Card key={k.label}>
              <CardHeader className="pb-2">
                <CardTitle className="font-sans text-sm font-medium text-muted-foreground">
                  {k.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl font-semibold text-deep-teal">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
