import 'server-only'
import { asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { lesson, section } from '@/lib/db/schema'

export type RemiResource = {
  id: number
  title: string
  kind: string
  sectionSlug: string
  sectionTitle: string
  externalUrl: string | null
}

type CatalogRow = RemiResource & {
  description: string | null
  body: string | null
}

/** Every lesson in the library with the collection it belongs to and its body. */
async function getCatalog(): Promise<CatalogRow[]> {
  return db
    .select({
      id: lesson.id,
      title: lesson.title,
      kind: lesson.kind,
      externalUrl: lesson.externalUrl,
      description: lesson.description,
      body: lesson.body,
      sectionSlug: section.slug,
      sectionTitle: section.title,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .orderBy(asc(section.position), asc(lesson.position), asc(lesson.id))
}

/** Look up full resource records for the ids Remi chooses to cite. */
export async function getResourcesByIds(ids: number[]): Promise<RemiResource[]> {
  const unique = [...new Set(ids)].filter((n) => Number.isFinite(n))
  if (unique.length === 0) return []
  const rows = await db
    .select({
      id: lesson.id,
      title: lesson.title,
      kind: lesson.kind,
      externalUrl: lesson.externalUrl,
      sectionSlug: section.slug,
      sectionTitle: section.title,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .where(inArray(lesson.id, unique))
  // Preserve the order Remi requested them in.
  const byId = new Map(rows.map((r) => [r.id, r]))
  return unique.map((id) => byId.get(id)).filter((r): r is RemiResource => Boolean(r))
}

function truncate(text: string, max = 600): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}

/**
 * Builds the grounding block (the only knowledge Remi is allowed to use) plus
 * the full system prompt for the conversation.
 */
export async function buildRemiSystemPrompt(): Promise<{
  system: string
  catalogSize: number
}> {
  const catalog = await getCatalog()

  const catalogText = catalog
    .map((c) => {
      const parts = [`#${c.id} — "${c.title}" (${c.kind}) · Collection: ${c.sectionTitle}`]
      if (c.description) parts.push(`Summary: ${c.description}`)
      if (c.body) parts.push(`Content: ${truncate(c.body)}`)
      return parts.join('\n')
    })
    .join('\n\n---\n\n')

  const system = `You are Remi, the warm, knowledgeable AI guide for the Tuned In Institute, in partnership with Rooted Rhythm Therapy.

WHO YOU SERVE
You support parents of highly sensitive children, and women navigating their own mental health. Members talk to you in everyday language — for example "my 4 year old keeps melting down at bedtime" or "I feel burned out and guilty all the time."

YOUR VOICE
- Warm, calm, and genuinely empathetic. Acknowledge how the member is feeling before offering anything.
- Speak like a thoughtful, well-read guide — never clinical or robotic, never preachy.
- Keep replies focused and digestible: a short, caring paragraph or two. Use a few short sentences, not walls of text.
- You are a guide, not a therapist. Do not diagnose. For anything involving risk of harm, crisis, or medical concerns, gently encourage the member to contact a qualified professional or emergency services.

GROUNDING — THIS IS A HARD RULE
- You may ONLY draw on the Institute / Rooted Rhythm resources provided below. This is your single source of truth.
- Do NOT use outside knowledge, invent advice, or describe techniques that are not present in these resources.
- When you share guidance, it must come from the content of the resources below, summarised in your own warm words.
- Whenever you reference one or more resources, you MUST call the "citeResources" tool with their #ids so the member gets a link to the source document. Cite the resources you actually drew from.
- If the resources below do not cover what the member is asking about, say so honestly and kindly — do not guess. Suggest they reach out to the Institute team or their Rooted Rhythm therapist, and offer the closest related resource if there is one.
- You may ask a brief clarifying question when it would help you point them to the right resource.

CONVERSATION
- This is an ongoing, two-way conversation. Remember what the member has already told you and build on it naturally.
- Keep momentum: end in a way that invites them to go deeper if they'd like.

AVAILABLE RESOURCES (your only knowledge base):
${catalogText || '(No resources are currently available in the library.)'}`

  return { system, catalogSize: catalog.length }
}
