import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const u = session.user as typeof session.user & { role?: string }
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role ?? 'client',
    emailVerified: u.emailVerified,
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
