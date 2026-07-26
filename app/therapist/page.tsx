import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { requireStaff } from '@/lib/session'
import { TherapistClientManager } from '@/components/therapist/therapist-client-manager'

export const dynamic = 'force-dynamic'

export default async function TherapistPage() {
  const staff = await requireStaff()

  // Only the clients this staff member personally onboarded.
  const clients = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .where(and(eq(user.createdById, staff.id), eq(user.role, 'client')))
    .orderBy(desc(user.createdAt))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-deep-teal">Add clients to Tuned In</h1>
        <p className="mt-2 max-w-2xl font-sans leading-relaxed text-muted-foreground">
          Create a Tuned In Institute account for your client and share their sign-in details right
          in session. They&apos;ll be prompted to choose their own password the first time they sign
          in, and can always use &ldquo;Forgot password?&rdquo; if they get locked out.
        </p>
      </div>
      <TherapistClientManager clients={clients} />
    </div>
  )
}
