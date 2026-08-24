import { requireAdmin } from '@/lib/session'
import { listAuditActions, listAuditEvents } from '@/lib/audit'
import { AuditLogViewer } from '@/components/admin/audit-log-viewer'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; offset?: string }>
}) {
  await requireAdmin()

  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const action = params.action?.trim() ?? ''
  const parsedOffset = Number.parseInt(params.offset ?? '0', 10)
  const offset = Number.isFinite(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0

  const { rows, total } = await listAuditEvents({ query, action, limit: PAGE_SIZE, offset })
  const actions = listAuditActions()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-deep-teal">Activity log</h1>
        <p className="mt-2 max-w-2xl text-pretty font-sans leading-relaxed text-muted-foreground">
          A permanent record of staff access to member accounts — who viewed, created, changed or
          removed what, and when. Required by the HIPAA Security Rule, and the only way to answer
          &ldquo;whose data was affected?&rdquo; after an incident.
        </p>
      </div>

      <AuditLogViewer
        rows={rows}
        total={total}
        actions={actions}
        query={query}
        action={action}
        offset={offset}
        limit={PAGE_SIZE}
      />

      <div className="rounded-lg border border-border bg-secondary p-3">
        <h2 className="font-sans text-sm font-semibold text-deep-teal">About this log</h2>
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 font-sans text-sm leading-relaxed text-muted-foreground">
          <li>
            Entries are written once and never edited or deleted, including when the member account
            they refer to is removed.
          </li>
          <li>
            It records <strong>that</strong> an access happened — never the content of a Remi
            conversation or anything a member wrote about their family.
          </li>
          <li>
            HIPAA expects records like this to be retained for <strong>six years</strong>. There is
            no automatic deletion.
          </li>
        </ul>
      </div>
    </div>
  )
}
