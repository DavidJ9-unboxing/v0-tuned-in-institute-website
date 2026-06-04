// Server-side helpers for the admin metrics page: resolving a selected time
// range into concrete start/end dates + a sensible bucket granularity, and
// building a gap-filled time series so charts never have missing days/hours.
//
// All date math is done in UTC so it lines up with Postgres `date_trunc`,
// which runs in the database session timezone (UTC on Vercel). This keeps the
// JS-generated bucket keys identical to the SQL-generated ones.

export type RangeKey = 'today' | '7d' | '30d' | 'mtd' | 'ytd' | 'custom'
export type Granularity = 'hour' | 'day' | 'week'

export interface ResolvedRange {
  key: RangeKey
  /** Inclusive lower bound. */
  start: Date
  /** Exclusive upper bound. */
  end: Date
  granularity: Granularity
  /** Human label for the selected range, e.g. "Last 7 days". */
  label: string
  /** Number of whole days the range spans (used for per-day averages). */
  days: number
  /** Echoed back so the picker can repopulate the custom date inputs. */
  fromParam: string
  toParam: string
}

const DAY_MS = 24 * 60 * 60 * 1000

export const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'mtd', label: 'Month to date' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'custom', label: 'Custom range' },
]

function startOfUTCDay(d: Date): Date {
  const x = new Date(d)
  x.setUTCHours(0, 0, 0, 0)
  return x
}

/** Format a Date as a UTC 'YYYY-MM-DD' string (for <input type="date"> + keys). */
export function toDateInput(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`
}

/** Parse a 'YYYY-MM-DD' string into a UTC midnight Date, or null if invalid. */
function parseDateInput(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return Number.isNaN(date.getTime()) ? null : date
}

function chooseGranularity(start: Date, end: Date): Granularity {
  const days = Math.round((end.getTime() - start.getTime()) / DAY_MS)
  if (days <= 1) return 'hour'
  if (days <= 92) return 'day'
  return 'week'
}

/**
 * Resolve raw search params into a concrete range. Falls back to "Last 30 days"
 * for anything missing or malformed (including an incomplete custom range).
 */
export function resolveRange(params: {
  range?: string
  from?: string
  to?: string
}): ResolvedRange {
  const now = new Date()
  const todayStart = startOfUTCDay(now)
  const tomorrowStart = new Date(todayStart.getTime() + DAY_MS)
  const key = (params.range as RangeKey) || '30d'

  let start: Date
  let end: Date = tomorrowStart
  let label: string

  switch (key) {
    case 'today':
      start = todayStart
      end = tomorrowStart
      label = 'Today'
      break
    case '7d':
      start = new Date(tomorrowStart.getTime() - 7 * DAY_MS)
      label = 'Last 7 days'
      break
    case 'mtd':
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      label = 'Month to date'
      break
    case 'ytd':
      start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
      label = 'Year to date'
      break
    case 'custom': {
      const from = parseDateInput(params.from)
      const to = parseDateInput(params.to)
      if (from && to && from.getTime() <= to.getTime()) {
        start = from
        end = new Date(to.getTime() + DAY_MS) // make `to` inclusive
        label = 'Custom range'
        break
      }
      // Incomplete/invalid custom range -> fall back to 30 days.
      start = new Date(tomorrowStart.getTime() - 30 * DAY_MS)
      label = 'Last 30 days'
      return finalize('30d', start, tomorrowStart, label)
    }
    case '30d':
    default:
      start = new Date(tomorrowStart.getTime() - 30 * DAY_MS)
      label = 'Last 30 days'
      return finalize('30d', start, tomorrowStart, label)
  }

  return finalize(key, start, end, label)
}

function finalize(key: RangeKey, start: Date, end: Date, label: string): ResolvedRange {
  const granularity = chooseGranularity(start, end)
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS))
  return {
    key,
    start,
    end,
    granularity,
    label,
    days,
    fromParam: toDateInput(start),
    toParam: toDateInput(new Date(end.getTime() - DAY_MS)),
  }
}

export interface Bucket {
  /** Matches the SQL `to_char(...)` key exactly. */
  key: string
  /** Short human label for the x-axis. */
  label: string
}

/** Postgres `to_char` format for the chosen granularity. */
export function bucketFormat(granularity: Granularity): string {
  return granularity === 'hour' ? 'YYYY-MM-DD HH24":00"' : 'YYYY-MM-DD'
}

function mondayOf(d: Date): Date {
  // Postgres date_trunc('week') anchors to Monday. Replicate that in UTC.
  const x = startOfUTCDay(d)
  const dow = x.getUTCDay() // 0 = Sun ... 1 = Mon
  const diff = (dow + 6) % 7 // days since Monday
  return new Date(x.getTime() - diff * DAY_MS)
}

/**
 * Build the full ordered list of buckets between start and end so the chart
 * renders every interval, including ones with zero activity.
 */
export function buildBuckets(start: Date, end: Date, granularity: Granularity): Bucket[] {
  const buckets: Bucket[] = []

  if (granularity === 'hour') {
    const hourFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', timeZone: 'UTC' })
    for (let t = startOfUTCDay(start).getTime(); t < end.getTime(); t += 60 * 60 * 1000) {
      const d = new Date(t)
      const key = `${toDateInput(d)} ${String(d.getUTCHours()).padStart(2, '0')}:00`
      buckets.push({ key, label: hourFmt.format(d) })
    }
    return buckets
  }

  const dayFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  if (granularity === 'week') {
    for (let cursor = mondayOf(start); cursor.getTime() < end.getTime(); ) {
      buckets.push({ key: toDateInput(cursor), label: dayFmt.format(cursor) })
      cursor = new Date(cursor.getTime() + 7 * DAY_MS)
    }
    return buckets
  }

  // day
  for (let t = startOfUTCDay(start).getTime(); t < end.getTime(); t += DAY_MS) {
    const d = new Date(t)
    buckets.push({ key: toDateInput(d), label: dayFmt.format(d) })
  }
  return buckets
}
