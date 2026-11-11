import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const sql = `
CREATE TABLE IF NOT EXISTS group_interest (
  id serial PRIMARY KEY,
  "userId" text REFERENCES "user"(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  "groupType" text NOT NULL,
  "childAge" text,
  goals text,
  availability text,
  status text NOT NULL DEFAULT 'new',
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS group_interest_created_idx ON group_interest ("createdAt" DESC);
`

const res = await pool.query(sql)
console.log('[v0] group_interest table ready', res.command ?? 'ok')
await pool.end()
