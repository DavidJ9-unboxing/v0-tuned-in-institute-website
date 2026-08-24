import 'server-only'

import { headers } from 'next/headers'
import { desc, eq, and, gte, sql, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'
import type { SessionUser } from '@/lib/session'

/**
 * Audit logging for staff access to member data.
 *
 * Required by the HIPAA Security Rule (§164.312(b)): "Implement hardware,
 * software, and/or procedural mechanisms that record and examine activity in
 * information systems that contain or use electronic protected health
 * information."
 *
 * IMPORTANT — what must never go in here:
 * Only record *that* an access happened and *who* did it. Never write
 * conversation content, clinical notes, passwords, reset tokens, or any
 * free-text a member wrote about themselves or their child. The `detail` field
 * is for short operational context ('role: client -> admin'), nothing more.
 * An audit log that itself contains PHI becomes a second liability.
 */

/** Stable action keys. Add new ones here so the set stays reviewable. */
export const AUDIT_ACTIONS = {
  // Reads. Viewing the member list is itself a disclosure: because Tuned In
  // access is limited to Rooted Rhythm's fee-paying clients, "has an account"
  // reveals "is a therapy client".
  MEMBER_LIST_VIEW: 'member_list.view',
  MEMBER_LIST_VIEW_SCOPED: 'member_list.view_scoped',
  // Writes affecting a member's account.
  MEMBER_CREATE: 'member.create',
  MEMBER_DELETE: 'member.delete',
  MEMBER_ROLE_CHANGE: 'member.role_change',
  MEMBER_PASSWORD_RESET: 'member.password_reset',
  // Access-control events.
  ACCESS_DENIED: 'access.denied',
} as const

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS]
export type AuditOutcome = 'success' | 'failure' | 'denied'

type Actor = Pick<SessionUser, 'id' | 'email' | 'role'>

export type AuditEntry = {
  actor: Actor | null
  action: AuditAction
  targetType?: 'user' | 'member_list'
  targetId?: string | null
  /**
   * Human-readable label for the target, snapshotted at write time so the log
   * stays meaningful after the underlying row is deleted. For a member this is
   * their email — necessary to identify whose data was affected, which is the
   * whole point of the log.
   */
  targetLabel?: string | null
  outcome?: AuditOutcome
  /** Short, non-PHI context. */
  detail?: string | null
}

/** Truncates free text so a stray large value can't bloat the log. */
function clamp(value: string | null | undefined, max: number): string | null {
  if (!value) return null
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

/**
 * Best-effort capture of request origin. Behind Vercel's proxy the client IP
 * arrives in `x-forwarded-for` as a comma-separated chain; the first entry is
 * the original client.
 */
async function requestContext() {
  try {
    const h = await headers()
    const forwarded = h.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
    return { ipAddress: ip, userAgent: clamp(h.get('user-agent'), 400) }
  } catch {
    // `headers()` throws outside a request scope (e.g. a background script).
    return { ipAddress: null, userAgent: null }
  }
}

/**
 * Collapses repeated identical list-view events from the same actor inside this
 * window into one row.
 *
 * Why: `revalidatePath('/admin/accounts')` re-renders the page after every
 * mutation, and Next.js may render a server component more than once per
 * navigation. Without this, a single visit writes 2+ identical "viewed member
 * list" rows, and one delete produces four. That noise is not harmless — an
 * audit log is only useful if a human can scan it, and burying real events
 * under duplicates defeats the purpose.
 *
 * Deliberately applies ONLY to list views. Every mutation and every denied
 * attempt is always written, even if identical and rapid: two password resets
 * in a row are two real events.
 */
const VIEW_DEDUPE_WINDOW_MS = 30_000

function isDedupableView(action: AuditAction) {
  return (
    action === AUDIT_ACTIONS.MEMBER_LIST_VIEW ||
    action === AUDIT_ACTIONS.MEMBER_LIST_VIEW_SCOPED
  )
}

async function hasRecentIdenticalView(entry: AuditEntry): Promise<boolean> {
  if (!isDedupableView(entry.action) || !entry.actor) return false
  const since = new Date(Date.now() - VIEW_DEDUPE_WINDOW_MS)
  const [existing] = await db
    .select({ id: auditLog.id })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.action, entry.action),
        eq(auditLog.actorId, entry.actor.id),
        gte(auditLog.createdAt, since),
      ),
    )
    .limit(1)
  return Boolean(existing)
}

/**
 * Writes one audit row.
 *
 * Deliberately fail-soft: a logging outage must not stop a therapist resetting
 * a locked-out client's password mid-session. Failures are logged loudly to the
 * server console so they surface in monitoring rather than vanishing.
 *
 * This is a real trade-off. The stricter reading of the Security Rule would
 * block the action if it cannot be recorded. We chose availability because the
 * users here are clinicians working with clients in real time, and a failed
 * password reset has an immediate human cost. Worth revisiting with the lawyer.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    if (await hasRecentIdenticalView(entry)) return
    const { ipAddress, userAgent } = await requestContext()
    await db.insert(auditLog).values({
      actorId: entry.actor?.id ?? null,
      actorEmail: entry.actor?.email ?? null,
      actorRole: entry.actor?.role ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      targetLabel: clamp(entry.targetLabel, 320),
      outcome: entry.outcome ?? 'success',
      detail: clamp(entry.detail, 500),
      ipAddress,
      userAgent,
    })
  } catch (err) {
    console.error(
      '[v0] AUDIT WRITE FAILED — this is a compliance gap, investigate:',
      entry.action,
      err instanceof Error ? err.message : err,
    )
  }
}

export type AuditRow = {
  id: number
  createdAt: Date
  actorEmail: string | null
  actorRole: string | null
  action: string
  targetType: string | null
  targetId: string | null
  targetLabel: string | null
  outcome: string
  detail: string | null
  ipAddress: string | null
}

export type AuditFilter = {
  /** Free-text match against actor email, target label, or action. */
  query?: string
  /** Restrict to one action key. */
  action?: string
  limit?: number
  offset?: number
}

/** Reads the audit trail, most recent first. Admin-only at the call site. */
export async function listAuditEvents(
  filter: AuditFilter = {},
): Promise<{ rows: AuditRow[]; total: number }> {
  const limit = Math.min(filter.limit ?? 50, 200)
  const offset = filter.offset ?? 0

  const conditions: SQL[] = []
  if (filter.action) {
    conditions.push(eq(auditLog.action, filter.action))
  }
  if (filter.query?.trim()) {
    const needle = `%${filter.query.trim().toLowerCase()}%`
    conditions.push(
      sql`(lower(coalesce(${auditLog.actorEmail}, '')) like ${needle}
        or lower(coalesce(${auditLog.targetLabel}, '')) like ${needle}
        or lower(${auditLog.action}) like ${needle})`,
    )
  }
  const where = conditions.length ? and(...conditions) : undefined

  const [rows, counted] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        createdAt: auditLog.createdAt,
        actorEmail: auditLog.actorEmail,
        actorRole: auditLog.actorRole,
        action: auditLog.action,
        targetType: auditLog.targetType,
        targetId: auditLog.targetId,
        targetLabel: auditLog.targetLabel,
        outcome: auditLog.outcome,
        detail: auditLog.detail,
        ipAddress: auditLog.ipAddress,
      })
      .from(auditLog)
      .where(where)
      .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
      .limit(limit)
      .offset(offset),
    db.select({ n: sql<number>`count(*)::int` }).from(auditLog).where(where),
  ])

  return { rows, total: counted[0]?.n ?? 0 }
}

/**
 * The event types offered in the filter dropdown.
 *
 * Deliberately the full known set from AUDIT_ACTIONS, rather than
 * `SELECT DISTINCT action FROM audit_log`. Deriving the options from rows that
 * happen to exist means you cannot filter for an event type until it has
 * already occurred — so "show me every account deletion" is unavailable
 * precisely when the answer is "none", which is the reassuring answer you were
 * looking for. It also made bookmarked filter URLs silently fall back to
 * "All events", because the selected option was never rendered.
 */
export function listAuditActions(): string[] {
  return Object.values(AUDIT_ACTIONS).slice().sort()
}
