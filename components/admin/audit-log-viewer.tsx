import Link from 'next/link'
import { ShieldCheck, ShieldAlert, ShieldX, Search } from 'lucide-react'
import type { AuditRow } from '@/lib/audit'

/**
 * Human-readable labels for the stable action keys. Kept here (not in the
 * database) so wording can change without rewriting history.
 */
const ACTION_LABELS: Record<string, string> = {
  'member_list.view': 'Viewed full member list',
  'member_list.view_scoped': 'Viewed own clients',
  'member.create': 'Created account',
  'member.delete': 'Deleted account',
  'member.role_change': 'Changed role',
  'member.password_reset': 'Reset password',
  'access.denied': 'Access denied',
}

function actionLabel(action: string) {
  return ACTION_LABELS[action] ?? action
}

/** Explicit UTC so a compliance record is never ambiguous about timezone. */
function formatUtc(date: Date) {
  const iso = new Date(date).toISOString()
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`
}

const OUTCOME_STYLES: Record<string, { className: string; Icon: typeof ShieldCheck; label: string }> =
  {
    success: {
      className: 'bg-sage-light text-deep-teal',
      Icon: ShieldCheck,
      label: 'Success',
    },
    denied: {
      className: 'bg-amber/20 text-charcoal',
      Icon: ShieldAlert,
      label: 'Denied',
    },
    failure: {
      className: 'bg-destructive/10 text-destructive',
      Icon: ShieldX,
      label: 'Failed',
    },
  }

type Props = {
  rows: AuditRow[]
  total: number
  actions: string[]
  query: string
  action: string
  offset: number
  limit: number
}

export function AuditLogViewer({ rows, total, actions, query, action, offset, limit }: Props) {
  const showingFrom = total === 0 ? 0 : offset + 1
  const showingTo = Math.min(offset + limit, total)
  const hasPrev = offset > 0
  const hasNext = offset + limit < total

  function pageHref(nextOffset: number) {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (action) params.set('action', action)
    if (nextOffset > 0) params.set('offset', String(nextOffset))
    const qs = params.toString()
    return qs ? `/admin/audit?${qs}` : '/admin/audit'
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filters. A plain GET form keeps this a server-rendered page: no client
          JS, and every filtered view is a shareable URL. */}
      <form
        method="get"
        action="/admin/audit"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="audit-q"
            className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Search staff or member
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="audit-q"
              name="q"
              defaultValue={query}
              placeholder="email or action"
              className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-2 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="audit-action"
            className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Event type
          </label>
          <select
            id="audit-action"
            name="action"
            defaultValue={action}
            className="w-full rounded-md border border-input bg-background px-2 py-2 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All events</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {actionLabel(a)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="min-h-10 rounded-md bg-deep-teal px-4 py-2 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-teal-deep"
        >
          Filter
        </button>
      </form>

      <p className="font-sans text-sm text-muted-foreground">
        {total === 0
          ? 'No matching events.'
          : `Showing ${showingFrom}–${showingTo} of ${total} events`}
      </p>

      {/* Stacked cards rather than a table: at narrow widths a six-column table
          either overflows the page or abbreviates its headers into nonsense.
          Every field stays fully labelled here. */}
      <ul className="flex list-none flex-col gap-3 p-0">
        {rows.map((row) => {
          const outcome = OUTCOME_STYLES[row.outcome] ?? OUTCOME_STYLES.success
          const { Icon } = outcome
          return (
            <li
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-sans text-xs font-medium ${outcome.className}`}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {outcome.label}
                </span>
                <span className="font-sans text-sm font-semibold text-deep-teal">
                  {actionLabel(row.action)}
                </span>
              </div>

              <dl className="flex flex-col gap-1.5 font-sans text-sm">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-muted-foreground">Staff member</dt>
                  <dd className="break-all font-medium text-foreground">
                    {row.actorEmail ?? 'system'}
                    {row.actorRole ? (
                      // `break-all` on the parent is needed so long emails wrap
                      // inside a 300px card, but it also splits this short role
                      // into "(ad min)". Opt this span out of that.
                      <span className="ml-1 whitespace-nowrap font-normal text-muted-foreground">
                        ({row.actorRole})
                      </span>
                    ) : null}
                  </dd>
                </div>

                {row.targetLabel ? (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground">Member affected</dt>
                    <dd className="break-all font-medium text-foreground">{row.targetLabel}</dd>
                  </div>
                ) : null}

                {row.detail ? (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground">Detail</dt>
                    <dd className="text-pretty text-foreground">{row.detail}</dd>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-muted-foreground">When</dt>
                  <dd className="font-mono text-xs text-foreground">{formatUtc(row.createdAt)}</dd>
                </div>

                {row.ipAddress ? (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground">IP address</dt>
                    <dd className="break-all font-mono text-xs text-foreground">{row.ipAddress}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          )
        })}
      </ul>

      {(hasPrev || hasNext) && (
        <nav className="flex items-center justify-between gap-3" aria-label="Audit log pages">
          {hasPrev ? (
            <Link
              href={pageHref(Math.max(0, offset - limit))}
              className="min-h-10 rounded-md border border-border px-3 py-2 font-sans text-sm font-medium text-deep-teal transition-colors hover:bg-sage-light"
            >
              Newer
            </Link>
          ) : (
            <span />
          )}
          {hasNext ? (
            <Link
              href={pageHref(offset + limit)}
              className="min-h-10 rounded-md border border-border px-3 py-2 font-sans text-sm font-medium text-deep-teal transition-colors hover:bg-sage-light"
            >
              Older
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}
