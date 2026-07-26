import { Pool } from 'pg'
import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'

const EMAIL = 'v0-verify-throwaway@example.com'
const PASSWORD = 'Verify-Test-12345'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const action = process.argv[2]

async function create() {
  // clean any prior run first
  await remove(true)
  const userId = randomUUID()
  const now = new Date()
  await pool.query(
    `insert into "user" (id,name,email,"emailVerified",role,"mustChangePassword","createdAt","updatedAt")
     values ($1,$2,$3,true,'client',false,$4,$4)`,
    [userId, 'V0 Verify', EMAIL, now],
  )
  const hash = await hashPassword(PASSWORD)
  await pool.query(
    `insert into account (id,"accountId","providerId","userId",password,"createdAt","updatedAt")
     values ($1,$2,'credential',$3,$4,$5,$5)`,
    [randomUUID(), userId, userId, hash, now],
  )
  console.log('CREATED', EMAIL, '/', PASSWORD)
}

async function remove(quiet = false) {
  const u = await pool.query('select id from "user" where email=$1', [EMAIL])
  for (const row of u.rows) {
    await pool.query('delete from session where "userId"=$1', [row.id])
    await pool.query('delete from account where "userId"=$1', [row.id])
    await pool.query('delete from "user" where id=$1', [row.id])
  }
  if (!quiet) console.log('REMOVED', u.rows.length, 'user(s)')
}

;(action === 'remove' ? remove() : create())
  .then(() => pool.end())
  .catch((e) => {
    console.error('ERR', e.message)
    process.exit(1)
  })
