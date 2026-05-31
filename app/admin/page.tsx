import Link from 'next/link'
import { db } from '@/lib/db'
import { lesson, section, user } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const [sections, lessons, users] = await Promise.all([
    db.select({ id: section.id }).from(section),
    db.select({ id: lesson.id }).from(lesson),
    db.select({ id: user.id }).from(user),
  ])

  const stats = [
    { label: 'Collections', value: sections.length, href: '/admin/content' },
    { label: 'Lessons', value: lessons.length, href: '/admin/content' },
    { label: 'Accounts', value: users.length, href: '/admin/accounts' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-deep-teal">Welcome back</h1>
        <p className="mt-2 max-w-2xl font-sans leading-relaxed text-muted-foreground">
          Manage your video collections, publish new lessons, and control who can
          access the member library.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="font-sans text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-4xl font-semibold text-deep-teal">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl text-deep-teal">Add content</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Create a collection like &ldquo;Tuned In Teens&rdquo; and upload videos or
              write articles into it.
            </p>
            <Link
              href="/admin/content"
              className="inline-flex w-fit items-center rounded-md bg-deep-teal px-4 py-2 font-sans text-sm font-semibold text-off-white transition-opacity hover:opacity-90"
            >
              Manage content
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl text-deep-teal">Invite a client</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Create an account for a verified client. They&apos;ll receive an email to
              confirm and set up their login.
            </p>
            <Link
              href="/admin/accounts"
              className="inline-flex w-fit items-center rounded-md bg-deep-teal px-4 py-2 font-sans text-sm font-semibold text-off-white transition-opacity hover:opacity-90"
            >
              Manage accounts
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
