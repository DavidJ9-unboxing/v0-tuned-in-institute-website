import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { sendAuthEmail } from '@/lib/email'

const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  baseURL,
  user: {
    additionalFields: {
      // Surfaced in the session so the client can prompt members who are still
      // using their temporary password to choose a new one. Not user-settable
      // via the sign-up/update APIs (we manage it server-side).
      mustChangePassword: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // No public self-registration — the admin team creates client accounts.
    disableSignUp: true,
    // Admin-created accounts are auto-verified on creation, so we don't block
    // sign-in on email verification. Email is still used for password resets.
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Set your Tuned In Institute password',
        heading: 'Set your password',
        intro:
          'We received a request to set the password for your Tuned In Institute account. Click below to choose a new password. This link expires in one hour.',
        buttonLabel: 'Set my password',
        buttonUrl: url,
        footer: 'If you did not request this, you can safely ignore this email.',
      })
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Verify your Tuned In Institute email',
        heading: 'Verify your email',
        intro:
          'Please confirm your email address to activate your Tuned In Institute content library access.',
        buttonLabel: 'Verify email',
        buttonUrl: url,
      })
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days (supports "remember me")
    updateAge: 60 * 60 * 24, // refresh daily
  },
  plugins: [
    admin({
      defaultRole: 'client',
      adminRoles: ['admin'],
    }),
  ],
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? ['http://localhost:3000']
      : []),
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    'https://tunedininstitute.org',
    'https://www.tunedininstitute.org',
  ],
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          // In the v0 preview iframe (cross-site), force these cookie
          // attributes so the session cookie is retained by the browser.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
