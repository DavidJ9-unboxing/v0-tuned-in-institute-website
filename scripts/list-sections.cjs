const { Pool } = require('pg')
;(async () => {
  const p = new Pool({ connectionString: process.env.DATABASE_URL })
  const rows = (
    await p.query(
      `select s.id, s.slug, s.title, s.position, s."collectionId",
              (select count(*) from lesson l where l."sectionId" = s.id and l.hidden = false) as visible_lessons
       from section s
       where s.hidden = false
       order by s."collectionId" nulls first, s.position, s.id`,
    )
  ).rows
  console.log('STANDALONE (collectionId null) — shown as their own library cards:')
  rows.filter((r) => !r.collectionId).forEach((r) =>
    console.log(`  id=${r.id} pos=${r.position} | ${r.title} | ${r.visible_lessons} lessons | slug=${r.slug}`),
  )
  console.log('\nINSIDE A COLLECTION:')
  rows.filter((r) => r.collectionId).forEach((r) =>
    console.log(`  id=${r.id} cid=${r.collectionId} | ${r.title} | ${r.visible_lessons} lessons`),
  )
  await p.end()
})().catch((e) => {
  console.error('ERR', e.message)
  process.exit(1)
})
