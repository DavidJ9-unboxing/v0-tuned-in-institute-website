'use server'

import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'

/**
 * Clears the "must change password" flag for the signed-in member. Called after
 * they successfully set their own password so they aren't prompted again.
 */
export async function clearMustChangePassword() {
  const current = await requireUser()
  await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, current.id))
}
