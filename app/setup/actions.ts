'use server'

import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

export type SetupState = { status: 'idle' | 'success' | 'error'; message: string }

/** True when at least one admin already exists. */
export async function adminExists(): Promise<boolean> {
  const admins = await db.select({ id: user.id }).from(user).where(eq(user.role, 'admin')).limit(1)
  return admins.length > 0
}

export async function createFirstAdmin(
  _prev: SetupState,
  formData: FormData,
): Promise<SetupState> {
  // Hard guard: once any admin exists, this is permanently disabled.
  if (await adminExists()) {
    return { status: 'error', message: 'Setup is already complete. An admin account exists.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!name || !email || password.length < 8) {
    return {
      status: 'error',
      message: 'Name, email, and a password of at least 8 characters are required.',
    }
  }

  try {
    await auth.api.createUser({
      body: { name, email, password, role: 'admin' },
    })
    // The bootstrap admin has no one to send them a verification email, so
    // mark their address verified immediately. (Sign-in requires verification.)
    await db.update(user).set({ emailVerified: true }).where(eq(user.email, email))
    return {
      status: 'success',
      message: 'Admin account created. You can now sign in.',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create the admin account.'
    return { status: 'error', message }
  }
}
