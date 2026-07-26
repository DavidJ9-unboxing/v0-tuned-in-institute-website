const { Pool } = require('pg')
;(async () => {
  const p = new Pool({ connectionString: process.env.DATABASE_URL })
  const [sec] = (await p.query("select id, slug, title from section where title ilike '%Additional Content (Rooted Rising%'")).rows
  console.log('SECTION:', JSON.stringify(sec))
  const rows = (await p.query(
    "select id, position, kind, title, hidden, \"externalUrl\" from lesson where \"sectionId\"=$1 order by position, id",
    [sec.id],
  )).rows
  rows.forEach((r) => console.log(`  #${r.position} id=${r.id} [${r.kind}] hidden=${r.hidden} "${r.title}" -> ${r.externalUrl || ''}`))
  await p.end()
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })
