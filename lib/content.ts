import { asc, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { lesson, section } from '@/lib/db/schema'

export type Section = typeof section.$inferSelect
export type Lesson = typeof lesson.$inferSelect

export type SectionWithCount = Section & { lessonCount: number }

/** All sections ordered by position, with a lesson count for each. */
export async function getSections(): Promise<SectionWithCount[]> {
  const rows = await db
    .select({
      id: section.id,
      slug: section.slug,
      title: section.title,
      description: section.description,
      position: section.position,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      lessonCount: sql<number>`count(${lesson.id})::int`,
    })
    .from(section)
    .leftJoin(lesson, eq(lesson.sectionId, section.id))
    .groupBy(section.id)
    .orderBy(asc(section.position), asc(section.id))
  return rows
}

export type SectionWithLessons = Section & { lessons: Lesson[] }

/** All sections with their full ordered lesson lists (used by the admin). */
export async function getSectionsWithLessons(): Promise<SectionWithLessons[]> {
  const sections = await db
    .select()
    .from(section)
    .orderBy(asc(section.position), asc(section.id))
  const lessons = await db
    .select()
    .from(lesson)
    .orderBy(asc(lesson.position), asc(lesson.id))
  return sections.map((s) => ({
    ...s,
    lessons: lessons.filter((l) => l.sectionId === s.id),
  }))
}

export async function getSectionBySlug(slug: string): Promise<Section | null> {
  const [row] = await db.select().from(section).where(eq(section.slug, slug)).limit(1)
  return row ?? null
}

export async function getLessonsForSection(sectionId: number): Promise<Lesson[]> {
  return db
    .select()
    .from(lesson)
    .where(eq(lesson.sectionId, sectionId))
    .orderBy(asc(lesson.position), asc(lesson.id))
}

/** Search lessons by title/description across all sections. */
export async function searchLessons(query: string): Promise<(Lesson & { sectionSlug: string; sectionTitle: string })[]> {
  const q = `%${query}%`
  const rows = await db
    .select({
      id: lesson.id,
      sectionId: lesson.sectionId,
      kind: lesson.kind,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      body: lesson.body,
      position: lesson.position,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      sectionSlug: section.slug,
      sectionTitle: section.title,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .where(or(ilike(lesson.title, q), ilike(lesson.description, q), ilike(section.title, q)))
    .orderBy(asc(section.position), asc(lesson.position))
    .limit(50)
  return rows
}
