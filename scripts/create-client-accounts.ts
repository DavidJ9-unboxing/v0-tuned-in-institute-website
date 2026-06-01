/**
 * One-time bulk creation of client accounts.
 *
 * Run with env loaded:
 *   set -a && source /vercel/share/.env.project && set +a \
 *     && npx tsx scripts/create-client-accounts.ts
 *
 * - Creates each account via the same Better Auth API the admin UI uses.
 * - Marks each email verified so they can sign in immediately.
 * - Skips anyone who already exists (safe to re-run).
 */
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, pool } from '@/lib/db'
import { user } from '@/lib/db/schema'

const PASSWORD = 'ROOTED2026'

// Safe by default: only writes when explicitly run with APPLY=1.
// Dry run reports what WOULD be created and which emails already exist, writing nothing.
const DRY_RUN = process.env.APPLY !== '1'

// name, email
const PEOPLE: [string, string][] = [
  ['Jamie Lee Ward', 'jamie@rootedrhythm.com'],
  ['Nicole Soto', 'nicole@rootedrhythm.com'],
  ['Sundi Crosswhite Shelton', 'sundi@rootedrhythm.com'],
  ['Briyona Benjamin', 'briyona@rootedrhythm.com'],
  ['Rachel Durkee', 'rachel@rootedrhythm.com'],
  ['Sara Galaso', 'sara@rootedrhythm.com'],
  ['Alena Brocker', 'alena@rootedrhythm.com'],
  ['Audrey Norton', 'audrey@rootedrhythm.com'],
  ['Bari Agnes', 'bari@rootedrhythm.com'],
  ['Casey Kemper', 'casey@rootedrhythm.com'],
  ['Elana Cohen', 'elana@rootedrhythm.com'],
  ['Ellen Alleman', 'ellen@rootedrhythm.com'],
  ['Gabrielle Price', 'gabrielle@rootedrhythm.com'],
  ['Kate Schramm', 'kate@rootedrhythm.com'],
  ['Kendall Schauermann', 'kendall@rootedrhythm.com'],
  ['Kyla Murray', 'kyla@rootedrhythm.com'],
  ['Lauren Whiteside', 'lauren@rootedrhythm.com'],
  ['Lex Rafael', 'lex@rootedrhythm.com'],
  ['Madeline Hulbert', 'madeline@rootedrhythm.com'],
  ['Maggie Rosen', 'maggie@rootedrhythm.com'],
  ['Marietta DeFreese', 'marietta@rootedrhythm.com'],
  ['Morgan Friedman', 'morgan@rootedrhythm.com'],
  ['Shelly Murphy', 'shelly@rootedrhythm.com'],
  ['Paige Davies', 'paige@rootedrhythm.com'],
  ['Sonya Zielinski', 'sonya@rootedrhythm.com'],
  ['Tara Sanders', 'tara@rootedrhythm.com'],
  ['Victoria Mancinelli', 'victoria@rootedrhythm.com'],
  ['Christopher Cypher', 'christopher@rootedrhythm.com'],
  ['Ellie Kayyem', 'ellie@rootedrhythm.com'],
  ['Erica Lazarus', 'erica@rootedrhythm.com'],
  ['Heather Stanley', 'heather@rootedrhythm.com'],
  ['Lila Coil', 'lila@rootedrhythm.com'],
  ['Audra Hasenmyer', 'audra@rootedrhythm.com'],
  ['Caylin Erb', 'caylin@rootedrhythm.com'],
  ['Chrissy Andreasen', 'chrissy@rootedrhythm.com'],
  ['Claire Byrnes', 'claire@rootedrhythm.com'],
  ['Colette Franz', 'colette@rootedrhythm.com'],
  ['Erin Wheatley', 'erinw@rootedrhythm.com'],
  ['Karis Miller', 'karis@rootedrhythm.com'],
  ['Kathryn Williams', 'kathryn@rootedrhythm.com'],
  ['Mary Grace Reeves', 'marygrace@rootedrhythm.com'],
  ['Sofia Panzenhagen', 'sofia@rootedrhythm.com'],
  ['Sophie Schauermann', 'sophie@rootedrhythm.com'],
  ['Amy Harmon', 'amy@rootedrhythm.com'],
  ['Katie Pendergast', 'admin@rootedrhythm.com'],
  ['Rita Rossi', 'rita@rootedrhythm.com'],
  ['Allen Lingensjo', 'allen@rootedrhythm.com'],
  ['Katie Gallagher', 'billing@rootedrhythm.com'],
  ['Jay Edwards', 'jay@rootedrhythm.com'],
]

async function main() {
  console.log(
    DRY_RUN
      ? '=== DRY RUN (no changes will be written). Re-run with APPLY=1 to create accounts. ===\n'
      : '=== APPLY MODE: creating accounts in the database ===\n',
  )

  let toCreate = 0
  let created = 0
  let skipped = 0
  let failed = 0

  for (const [name, rawEmail] of PEOPLE) {
    const email = rawEmail.trim().toLowerCase()
    const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
    if (existing.length) {
      console.log(`[skip]   ${email} already exists`)
      skipped++
      continue
    }

    if (DRY_RUN) {
      console.log(`[would create] ${email} (${name})`)
      toCreate++
      continue
    }

    try {
      await auth.api.createUser({
        body: { name, email, password: PASSWORD, role: 'client' },
      })
      await db.update(user).set({ emailVerified: true }).where(eq(user.email, email))
      console.log(`[ok]     ${email} (${name})`)
      created++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[fail]   ${email} - ${message}`)
      failed++
    }
  }

  if (DRY_RUN) {
    console.log(
      `\nDry run complete. would_create=${toCreate} already_exist=${skipped} total=${PEOPLE.length}`,
    )
    console.log('No changes were written. Re-run with APPLY=1 to create these accounts.')
  } else {
    console.log(
      `\nDone. created=${created} skipped=${skipped} failed=${failed} total=${PEOPLE.length}`,
    )
  }

  await pool.end()
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(async (err) => {
  console.error(err)
  await pool.end().catch(() => {})
  process.exit(1)
})
