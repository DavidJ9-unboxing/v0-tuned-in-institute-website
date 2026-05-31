import 'server-only'
import { asc, eq } from 'drizzle-orm'
import { generateText, Output } from 'ai'
import * as z from 'zod'
import { db } from '@/lib/db'
import { lesson, section } from '@/lib/db/schema'

export type SearchHit = {
  id: number
  title: string
  kind: string
  sectionSlug: string
  sectionTitle: string
  externalUrl: string | null
  /** A one-sentence, parent-facing explanation of why this resource fits. */
  reason: string
}

type CatalogItem = {
  id: number
  title: string
  description: string | null
  kind: string
  externalUrl: string | null
  sectionSlug: string
  sectionTitle: string
}

/** Every lesson in the library, with the collection it belongs to. */
async function getSearchCatalog(): Promise<CatalogItem[]> {
  return db
    .select({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      kind: lesson.kind,
      externalUrl: lesson.externalUrl,
      sectionSlug: section.slug,
      sectionTitle: section.title,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .orderBy(asc(section.position), asc(lesson.position), asc(lesson.id))
}

const resultSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number().describe('The #id of a catalog item that genuinely fits the question.'),
        reason: z
          .string()
          .describe(
            'One warm, plain-language sentence, addressed to the parent, explaining why this resource helps.',
          ),
      }),
    )
    .describe('Up to 8 items, ordered most relevant first. Empty if nothing is a good fit.'),
})

const SYSTEM_PROMPT = `You are the Tuned In Institute library concierge for Rooted Rhythm Therapy.
The library helps parents of highly sensitive children, and women navigating their own mental health.
A member will describe what they are going through in everyday language (for example: "my 4 year old keeps melting down at bedtime" or "I feel burned out and guilty all the time").

Your job: from the provided catalog, choose the resources that best answer their need.
Rules:
- Only choose items that are genuinely relevant. Quality over quantity. It is fine to return fewer than 8, or none.
- Order results from most to least relevant.
- Interpret intent, not just keywords (e.g. "won't go to school" relates to school refusal and separation anxiety; "I snap at my kids" relates to calm parenting and parent self-regulation).
- For each result, write one warm, concrete sentence addressed to the parent explaining why it helps. Do not invent resources or ids that are not in the catalog.`

/**
 * Interpret a natural-language question and return the most relevant lessons.
 * Uses the LLM to rank the (small) catalog by intent, then maps ids back to
 * full lesson records.
 */
export async function aiSearchLessons(query: string): Promise<SearchHit[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const catalog = await getSearchCatalog()
  if (catalog.length === 0) return []

  const catalogText = catalog
    .map(
      (c) =>
        `#${c.id} [${c.sectionTitle}] ${c.title}${c.description ? ` — ${c.description}` : ''}`,
    )
    .join('\n')

  const { output } = await generateText({
    model: 'openai/gpt-5.4-mini',
    output: Output.object({ schema: resultSchema }),
    system: SYSTEM_PROMPT,
    prompt: `Member's question:\n"""${trimmed}"""\n\nCatalog (choose only from these ids):\n${catalogText}`,
  })

  const byId = new Map(catalog.map((c) => [c.id, c]))
  const hits: SearchHit[] = []
  for (const r of output.results) {
    const item = byId.get(r.id)
    if (!item) continue
    hits.push({
      id: item.id,
      title: item.title,
      kind: item.kind,
      sectionSlug: item.sectionSlug,
      sectionTitle: item.sectionTitle,
      externalUrl: item.externalUrl,
      reason: r.reason,
    })
  }
  return hits
}
