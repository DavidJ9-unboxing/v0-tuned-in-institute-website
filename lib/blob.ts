import 'server-only'
import { getDownloadUrl, issueSignedToken, presignUrl } from '@vercel/blob'

/**
 * The Blob store is configured for PRIVATE access, so raw blob URLs can't be
 * loaded directly (they require authentication). This turns a stored blob URL
 * into a short-lived signed URL that the browser can fetch, used by the
 * authenticated file proxy route. We sign per-request rather than storing
 * signed URLs so links can't be shared or outlive the member's access.
 */
export async function signBlobUrl(
  blobUrl: string,
  { download = false }: { download?: boolean } = {},
): Promise<string> {
  // The pathname within the store, e.g. "teen-parenting-course/m1.pdf".
  const pathname = new URL(blobUrl).pathname.replace(/^\/+/, '')

  // Short-lived delegation scoped to read this one object.
  const validUntil = Date.now() + 10 * 60 * 1000 // 10 minutes
  const signedToken = await issueSignedToken({
    pathname,
    operations: ['get'],
    validUntil,
  })

  const { presignedUrl } = await presignUrl(signedToken, {
    operation: 'get',
    pathname,
    access: 'private',
    validUntil,
  })

  // ?download=1 makes the browser download instead of displaying inline.
  return download ? getDownloadUrl(presignedUrl) : presignedUrl
}
