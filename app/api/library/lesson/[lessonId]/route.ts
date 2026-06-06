import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { lesson, section } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'

/**
 * Returns the displayable details of a single visible lesson so members can
 * read it inside the Remi chat (in a reader dialog) without navigating away
 * and losing their conversation.
 *
 * We never expose the raw Blob URLs — videos and documents are streamed
 * through the authenticated /api/library/file/[id] proxy instead. Hidden
 * lessons (Remi-only background knowledge) are never returned.
 *
 * GET /api/library/lesson/123
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 })
  }

  const { lessonId } = await params
  const id = Number(lessonId)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid lesson.' }, { status: 400 })
  }

  const [row] = await db
    .select({
      id: lesson.id,
      kind: lesson.kind,
      title: lesson.title,
      description: lesson.description,
      body: lesson.body,
      externalUrl: lesson.externalUrl,
      fileName: lesson.fileName,
      hasFile: lesson.fileUrl,
      hasVideo: lesson.videoUrl,
      hidden: lesson.hidden,
      sectionHidden: section.hidden,
      sectionTitle: section.title,
      sectionSlug: section.slug,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .where(and(eq(lesson.id, id)))
    .limit(1)

  if (!row || row.hidden || row.sectionHidden) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  return NextResponse.json({
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    body: row.body,
    externalUrl: row.externalUrl,
    fileName: row.fileName,
    hasFile: Boolean(row.hasFile),
    hasVideo: Boolean(row.hasVideo),
    sectionTitle: row.sectionTitle,
    sectionSlug: row.sectionSlug,
  })
}
