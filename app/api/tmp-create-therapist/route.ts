import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { sendWelcomeEmail } from '@/lib/email'

// TEMPORARY one-off route to onboard therapist Kyla Murray. Deleted right after use.
export async function POST() {
  const name = 'Kyla Murray'
  const email = 'kyla@rootedrhythm.com'

  // Temp password in the same style as the admin flow: First + last initial + 5 digits.
  const password = `KylaM${Math.floor(10000 + Math.random() * 90000)}`

  try {
    // Reuse the real account-creation path so IDs/hashing match the app.
    await auth.api.createUser({
      body: { name, email, password, role: 'therapist' as 'admin' },
    })
    // Trust staff-created accounts: verify email + force password change on first sign-in.
    await db
      .update(user)
      .set({ emailVerified: true, mustChangePassword: true })
      .where(eq(user.email, email))

    const baseUrl =
      process.env.BETTER_AUTH_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'https://tunedininstitute.org')
    const signInUrl = `${baseUrl}/sign-in`

    const sent = await sendWelcomeEmail({ to: email, name, email, tempPassword: password, signInUrl })

    return Response.json({ ok: true, email, role: 'therapist', emailSent: sent.ok, emailError: sent.error ?? null })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
}
