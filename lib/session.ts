import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

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
  const u = session.user as typeof session.user & {
    role?: string
    mustChangePassword?: boolean
  }
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role ?? 'client',
    emailVerified: u.emailVerified,
    mustChangePassword: u.mustChangePassword ?? false,
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

/** Roles that can create and manage client accounts. */
export const STAFF_ROLES = ['admin', 'therapist'] as const

export function isStaffRole(role: string): boolean {
  return (STAFF_ROLES as readonly string[]).includes(role)
}

/**
 * Require a staff member (admin or therapist). Both can onboard clients;
 * admins additionally get the full admin dashboard. Redirects clients to the
 * library and guests to sign-in.
 */
export async function requireStaff(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  if (!isStaffRole(user.role)) redirect('/library')
  return user
}
