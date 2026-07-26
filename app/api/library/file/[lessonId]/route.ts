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
    // Documents (PDFs) are embedded in an <iframe>. Private Blob signed URLs are
    // served with a strict `content-security-policy: default-src 'none'`, which
    // makes Chrome's PDF viewer refuse to render them in a frame ("This page has
    // been blocked by Chrome"). So we proxy document bytes back through this
    // same-origin route with our own headers instead of redirecting. Range
    // requests are forwarded so the PDF viewer can page/seek efficiently.
    if (row.kind === 'document') {
      const signedUrl = await signBlobUrl(blobUrl)
      const range = request.headers.get('range')
      const upstream = await fetch(signedUrl, {
        headers: range ? { Range: range } : {},
        cache: 'no-store',
      })
      if (!upstream.ok && upstream.status !== 206) {
        return NextResponse.json({ error: 'Could not load this file.' }, { status: 502 })
      }

      const name = (row.fileName ?? 'document').replace(/["\\\r\n]/g, '')
      const isPdf =
        name.toLowerCase().endsWith('.pdf') ||
        (upstream.headers.get('content-type') ?? '').includes('application/pdf')

      const headers = new Headers()
      headers.set(
        'Content-Type',
        isPdf ? 'application/pdf' : (upstream.headers.get('content-type') ?? 'application/octet-stream'),
      )
      headers.set(
        'Content-Disposition',
        `${download ? 'attachment' : 'inline'}; filename="${name}"`,
      )
      headers.set('Accept-Ranges', 'bytes')
      const contentLength = upstream.headers.get('content-length')
      if (contentLength) headers.set('Content-Length', contentLength)
      const contentRange = upstream.headers.get('content-range')
      if (contentRange) headers.set('Content-Range', contentRange)
      headers.set('Cache-Control', 'private, no-store')

      return new NextResponse(upstream.body, { status: upstream.status, headers })
    }

    // Video and audio play via native <video>/<audio> elements, which load the
    // blob as a media sub-resource governed by our page (not the blob's CSP),
    // so a lightweight redirect to the signed URL is fine and avoids proxying
    // large media through the function.
    const signedUrl = await signBlobUrl(blobUrl, { download })
    return NextResponse.redirect(signedUrl)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load this file.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
