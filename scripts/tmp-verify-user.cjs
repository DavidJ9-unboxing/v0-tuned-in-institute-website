const { Pool } = require('pg')
const { hashPassword } = require('better-auth/crypto')
const crypto = require('crypto')
const EMAIL = 'v0-verify-throwaway@example.com'
;(async () => {
  const p = new Pool({ connectionString: process.env.DATABASE_URL })
  const action = process.argv[2]
  if (action === 'remove') {
    await p.query('delete from "user" where email=$1', [EMAIL])
    console.log('REMOVED')
    await p.end()
    return
  }
  if (action === 'docid') {
    const rows = (await p.query(
      "select id, title, \"fileName\" from lesson where kind='document' and hidden=false and \"fileUrl\" is not null order by id limit 5",
    )).rows
    console.log(JSON.stringify(rows))
    await p.end()
    return
  }
  const id = crypto.randomUUID()
  const now = new Date()
  await p.query(
    'insert into "user" (id,email,name,"emailVerified","createdAt","updatedAt",role) values ($1,$2,$3,true,$4,$4,$5)',
    [id, EMAIL, 'Verify', now, 'member'],
  )
  const hash = await hashPassword('Verify-Test-12345')
  await p.query(
    'insert into account (id,"accountId","providerId","userId",password,"createdAt","updatedAt") values ($1,$2,$3,$4,$5,$6,$6)',
    [crypto.randomUUID(), EMAIL, 'credential', id, hash, now],
  )
  console.log('CREATED')
  await p.end()
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })
