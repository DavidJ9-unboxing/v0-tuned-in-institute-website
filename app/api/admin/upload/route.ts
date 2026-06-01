import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'

// Client-side upload flow: the browser asks this route for a short-lived token,
// uploads the file straight to Blob, then notifies this route on completion.
// We gate token generation on an authenticated admin session.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
          throw new Error('Only admins can upload content.')
        }
        return {
          allowedContentTypes: [
            // Video
            'video/mp4',
            'video/quicktime',
            'video/webm',
            'video/x-m4v',
            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
          ],
          maximumSizeInBytes: 2 * 1024 * 1024 * 1024, // 2 GB
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // No-op: the lesson row is created via the admin form action once the
        // upload returns a blob URL.
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
