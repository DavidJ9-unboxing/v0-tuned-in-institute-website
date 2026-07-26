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

/**
 * Rooted Rhythm team members all use a @rootedrhythm.com email, so anyone on
 * that domain automatically gets therapist (client onboarding) access without
 * needing an admin to change their role first.
 */
export const STAFF_EMAIL_DOMAIN = 'rootedrhythm.com'

export function isStaffRole(role: string): boolean {
  return (STAFF_ROLES as readonly string[]).includes(role)
}

export function isStaffEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${STAFF_EMAIL_DOMAIN}`)
}

/** Whether a user can onboard clients — by role or by staff email domain. */
export function hasTherapistAccess(user: {
  role: string
  email: string
}): boolean {
  return isStaffRole(user.role) || isStaffEmail(user.email)
}

/**
 * Require a staff member (admin, therapist, or anyone on the staff email
 * domain). All can onboard clients; admins additionally get the full admin
 * dashboard. Redirects clients to the library and guests to sign-in.
 */
export async function requireStaff(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  if (!hasTherapistAccess(user)) redirect('/library')
  return user
}
