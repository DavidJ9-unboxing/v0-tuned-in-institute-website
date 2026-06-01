import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { lesson } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import { signBlobUrl } from '@/lib/blob'

/**
 * Authenticated proxy for files stored in the PRIVATE Blob store (uploaded
 * videos and documents). Signed-in members hit this route; we look up the
 * lesson, mint a short-lived signed URL for its blob, and redirect to it.
 * Hidden lessons (Remi-only knowledge) are never served here.
 *
 * GET /api/library/file/123          → inline (used by the PDF/video viewer)
 * GET /api/library/file/123?download=1 → forces a download
 */
export async function GET(
  request: Request,
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

  const [row] = await db.select().from(lesson).where(eq(lesson.id, id)).limit(1)
  if (!row || row.hidden) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  const blobUrl = row.kind === 'video' ? row.videoUrl : row.fileUrl
  if (!blobUrl) {
    return NextResponse.json({ error: 'No file for this lesson.' }, { status: 404 })
  }

  const download = new URL(request.url).searchParams.get('download') === '1'

  try {
    const signedUrl = await signBlobUrl(blobUrl, { download })
    return NextResponse.redirect(signedUrl)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load this file.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
