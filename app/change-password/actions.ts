'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'

export type ChangePasswordState = { status: 'idle' | 'error'; message: string }

/**
 * Sets a new password for the signed-in user and clears the
 * mustChangePassword flag. Used by the forced first-login password change.
 * On success it returns nothing meaningful because the client redirects.
 */
export async function forcePasswordChange(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const current = await requireUser()
  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (newPassword.length < 8) {
    return { status: 'error', message: 'Your new password must be at least 8 characters.' }
  }
  if (newPassword !== confirm) {
    return { status: 'error', message: 'The new passwords do not match.' }
  }
  if (newPassword === currentPassword) {
    return { status: 'error', message: 'Please choose a password different from the temporary one.' }
  }

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: await headers(),
    })
  } catch {
    return {
      status: 'error',
      message: 'That current password is incorrect. Enter the temporary password you signed in with.',
    }
  }

  await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, current.id))
  // Password set and flag cleared — send them into the library.
  redirect('/library')
}
