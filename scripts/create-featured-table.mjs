import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const sql = `
CREATE TABLE IF NOT EXISTS featured (
  id serial PRIMARY KEY,
  "lessonId" integer NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
  headline text,
  blurb text,
  position integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS featured_lesson_unique ON featured ("lessonId");
`

const res = await pool.query(sql)
console.log('[v0] featured table ready', res.command ?? 'ok')
await pool.end()
