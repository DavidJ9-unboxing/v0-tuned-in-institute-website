import { randomUUID } from 'node:crypto'
import pg from 'pg'
import { hashPassword } from 'better-auth/crypto'

const email = 'zeno@rootedrhythm.com'
const name = 'Zeno'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const existing = await pool.query('select id, role from "user" where lower(email) = $1', [email])
const password = `Zeno${Math.floor(10000 + Math.random() * 90000)}`
const hash = await hashPassword(password)

let userId
if (existing.rows.length) {
  userId = existing.rows[0].id
  await pool.query(
    'update "user" set role = $1, "emailVerified" = true, "mustChangePassword" = true, banned = false, "updatedAt" = now() where id = $2',
    ['admin', userId],
  )
  const upd = await pool.query(
    'update account set password = $1, "updatedAt" = now() where "userId" = $2 and "providerId" = $3',
    [hash, userId, 'credential'],
  )
  if (upd.rowCount === 0) {
    await pool.query(
      'insert into account (id, "accountId", "providerId", "userId", password) values ($1, $2, $3, $4, $5)',
      [randomUUID(), userId, 'credential', userId, hash],
    )
  }
  console.log('UPDATED_EXISTING', existing.rows[0].role)
} else {
  userId = randomUUID().replace(/-/g, '')
  await pool.query(
    'insert into "user" (id, name, email, "emailVerified", role, "mustChangePassword") values ($1, $2, $3, true, $4, true)',
    [userId, name, email, 'admin'],
  )
  await pool.query(
    'insert into account (id, "accountId", "providerId", "userId", password) values ($1, $2, $3, $4, $5)',
    [randomUUID(), userId, 'credential', userId, hash],
  )
  console.log('CREATED')
}

const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.BETTER_AUTH_URL ?? ''
const signInUrl = base ? `${base}/sign-in` : '/sign-in'

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'The Tuned In Institute <no-reply@tunedininstitute.org>',
    to: email,
    subject: 'Your Tuned In Institute admin account',
    html: `<div style="font-family:Arial,sans-serif;color:#1b4f5a;line-height:1.6">
<p>Hi ${name},</p>
<p>An admin account has been created for you on the Tuned In Institute site.</p>
<p><strong>Email:</strong> ${email}<br/><strong>Temporary password:</strong> ${password}</p>
<p><a href="${signInUrl}">Sign in here</a>. You'll be asked to choose your own password after signing in.</p>
</div>`,
  }),
})
console.log('EMAIL', res.status, base || '(no base url)')
console.log('PASSWORD', password)
await pool.end()
