import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
  mustChangePassword: boolean
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const u = session.user as typeof session.user & { role?: string }
  // The forced-password-change flag is a custom column not surfaced by Better
  // Auth's session, so read it directly.
  const [row] = await db
    .select({ mustChangePassword: user.mustChangePassword })
    .from(user)
    .where(eq(user.id, u.id))
    .limit(1)
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role ?? 'client',
    emailVerified: u.emailVerified,
    mustChangePassword: row?.mustChangePassword ?? false,
  }
}

/** Require any signed-in user. Redirects to /sign-in if not authenticated. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  return user
}

/** Require an admin. Redirects clients to the library, guests to sign-in. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  if (user.role !== 'admin') redirect('/library')
  return user
}
