import { and, asc, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { featured, lesson, section } from '@/lib/db/schema'

export type Section = typeof section.$inferSelect
export type Lesson = typeof lesson.$inferSelect
export type Featured = typeof featured.$inferSelect

export type SectionWithCount = Section & { lessonCount: number }

/**
 * All visible sections ordered by position, with a count of their visible
 * lessons. Hidden sections and hidden lessons are excluded — those exist only
 * as background knowledge for Remi, never in the library UI.
 */
export async function getSections(): Promise<SectionWithCount[]> {
  const rows = await db
    .select({
      id: section.id,
      slug: section.slug,
      title: section.title,
      description: section.description,
      hidden: section.hidden,
      position: section.position,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      lessonCount: sql<number>`cast(count(${lesson.id}) filter (where ${lesson.hidden} = false) as int)`,
    })
    .from(section)
    .leftJoin(lesson, eq(lesson.sectionId, section.id))
    .where(eq(section.hidden, false))
    .groupBy(section.id)
    .orderBy(asc(section.position), asc(section.id))
  return rows
}

export type FeaturedLesson = Lesson & {
  sectionSlug: string
  sectionTitle: string
  /** Admin overrides from the featured table (fall back to the lesson's own). */
  featuredId: number
  headline: string | null
  blurb: string | null
}

/**
 * Admin-curated featured content for the public resources page. Reads from the
 * featured table (joined to the lesson + section), applying any custom headline
 * and blurb, ordered by the admin-chosen position. Hidden lessons/sections are
 * filtered out so a featured item that later gets hidden won't leak.
 */
export async function getFeaturedLessons(limit = 4): Promise<FeaturedLesson[]> {
  const rows = await db
    .select({
      id: lesson.id,
      sectionId: lesson.sectionId,
      kind: lesson.kind,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      body: lesson.body,
      externalUrl: lesson.externalUrl,
      fileUrl: lesson.fileUrl,
      fileName: lesson.fileName,
      hidden: lesson.hidden,
      position: lesson.position,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      sectionSlug: section.slug,
      sectionTitle: section.title,
      featuredId: featured.id,
      headline: featured.headline,
      blurb: featured.blurb,
    })
    .from(featured)
    .innerJoin(lesson, eq(lesson.id, featured.lessonId))
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .where(and(eq(lesson.hidden, false), eq(section.hidden, false)))
    .orderBy(asc(featured.position), asc(featured.id))
    .limit(limit)
  return rows
}

export type FeaturedAdminRow = {
  featuredId: number
  lessonId: number
  position: number
  headline: string | null
  blurb: string | null
  lessonTitle: string
  lessonDescription: string | null
  kind: string
  sectionTitle: string
  sectionSlug: string
}

/**
 * All featured rows for the admin manager, joined to their lesson + section.
 * Not filtered by hidden state so admins can still see and remove a featured
 * item even if its lesson was later hidden.
 */
export async function getFeaturedForAdmin(): Promise<FeaturedAdminRow[]> {
  return db
    .select({
      featuredId: featured.id,
      lessonId: featured.lessonId,
      position: featured.position,
      headline: featured.headline,
      blurb: featured.blurb,
      lessonTitle: lesson.title,
      lessonDescription: lesson.description,
      kind: lesson.kind,
      sectionTitle: section.title,
      sectionSlug: section.slug,
    })
    .from(featured)
    .innerJoin(lesson, eq(lesson.id, featured.lessonId))
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .orderBy(asc(featured.position), asc(featured.id))
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

/** Look up a visible section by slug. Hidden sections return null (library 404). */
export async function getSectionBySlug(slug: string): Promise<Section | null> {
  const [row] = await db
    .select()
    .from(section)
    .where(and(eq(section.slug, slug), eq(section.hidden, false)))
    .limit(1)
  return row ?? null
}

/** Visible lessons for a section, ordered. Hidden lessons are excluded. */
export async function getLessonsForSection(sectionId: number): Promise<Lesson[]> {
  return db
    .select()
    .from(lesson)
    .where(and(eq(lesson.sectionId, sectionId), eq(lesson.hidden, false)))
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
      externalUrl: lesson.externalUrl,
      fileUrl: lesson.fileUrl,
      fileName: lesson.fileName,
      hidden: lesson.hidden,
      position: lesson.position,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      sectionSlug: section.slug,
      sectionTitle: section.title,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .where(
      and(
        eq(lesson.hidden, false),
        eq(section.hidden, false),
        or(ilike(lesson.title, q), ilike(lesson.description, q), ilike(section.title, q)),
      ),
    )
    .orderBy(asc(section.position), asc(lesson.position))
    .limit(50)
  return rows
}
