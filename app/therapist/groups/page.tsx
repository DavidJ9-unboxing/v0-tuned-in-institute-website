import type { Metadata } from 'next'
import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { groupInterest } from '@/lib/db/schema'
import { requireStaff } from '@/lib/session'
import { GROUP_TYPES, type GroupType } from '@/lib/groups'

export const metadata: Metadata = {
  title: 'Pod sign-ups',
  robots: { index: false, follow: false },
}

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export default async function GroupSignupsPage() {
  await requireStaff()
  const rows = await db.select().from(groupInterest).orderBy(desc(groupInterest.createdAt))

  const groups = (Object.keys(GROUP_TYPES) as GroupType[]).map((type) => ({
    type,
    label: GROUP_TYPES[type],
    people: rows.filter((r) => r.groupType === type),
  }))

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl font-semibold text-deep-teal">Pod sign-ups</h1>
        <p className="max-w-2xl font-serif text-[15px] leading-relaxed text-charcoal/75">
          Families and adults who signed up for a Connection &amp; Learning Pod from the library.
          Each new sign-up is also emailed to pod@rootedrhythm.com and Sophie.
        </p>
      </header>

      {groups.map((g) => (
        <section key={g.type} aria-labelledby={`h-${g.type}`} className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
            <h2 id={`h-${g.type}`} className="font-serif text-xl font-semibold text-deep-teal">
              {g.label}
            </h2>
            <span className="font-sans text-sm text-charcoal/60">
              {g.people.length} {g.people.length === 1 ? 'person' : 'people'}
            </span>
          </div>
          {g.people.length === 0 ? (
            <p className="font-serif text-[15px] text-charcoal/60">No sign-ups yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {g.people.map((p) => (
                <li key={p.id} className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-sans text-[15px] font-semibold text-charcoal">
                      {p.name}{' '}
                      <a href={`mailto:${p.email}`} className="font-normal text-teal-mid hover:underline">
                        {p.email}
                      </a>
                    </p>
                    <span className="font-sans text-xs text-charcoal/55">
                      {dateFormat.format(p.createdAt)}
                    </span>
                  </div>
                  {p.childAge && (
                    <p className="font-sans text-sm text-charcoal/75">Age: {p.childAge}</p>
                  )}
                  {p.availability && (
                    <p className="font-sans text-sm text-charcoal/75">Availability: {p.availability}</p>
                  )}
                  {p.goals && (
                    <p className="whitespace-pre-line font-serif text-[15px] leading-relaxed text-charcoal/85">
                      {p.goals}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  )
}
