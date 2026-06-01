/**
 * Converts a normal YouTube or Vimeo URL into a privacy-friendly embed URL
 * suitable for an <iframe>. Supports:
 *   - YouTube: watch?v=, youtu.be/, /embed/, /shorts/  (uses youtube-nocookie.com)
 *   - Vimeo:   vimeo.com/ID, vimeo.com/ID/HASH (unlisted), player.vimeo.com/video/ID
 *
 * Returns null if the URL isn't a recognised YouTube/Vimeo link.
 */
export function toEmbedUrl(raw: string): string | null {
  if (!raw) return null
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase()

  // --- YouTube -------------------------------------------------------------
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    let id = ''
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v') ?? ''
    } else if (url.pathname.startsWith('/embed/')) {
      id = url.pathname.slice('/embed/'.length)
    } else if (url.pathname.startsWith('/shorts/')) {
      id = url.pathname.slice('/shorts/'.length)
    }
    id = id.split('/')[0]
    if (!id) return null
    const start = url.searchParams.get('t') ?? url.searchParams.get('start')
    const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
    if (start) params.set('start', String(parseInt(start, 10) || 0))
    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
  }
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0] ?? ''
    if (!id) return null
    const start = url.searchParams.get('t')
    const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
    if (start) params.set('start', String(parseInt(start, 10) || 0))
    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
  }

  // --- Vimeo ---------------------------------------------------------------
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const parts = url.pathname.split('/').filter(Boolean)
    // player.vimeo.com/video/ID  → drop the leading "video" segment
    if (parts[0] === 'video') parts.shift()
    const id = parts[0]
    if (!id || !/^\d+$/.test(id)) return null
    // Unlisted videos carry a privacy hash, either as the next path segment
    // (vimeo.com/ID/HASH) or as the ?h= query param.
    const hash = parts[1] || url.searchParams.get('h') || ''
    const params = new URLSearchParams()
    if (hash) params.set('h', hash)
    const query = params.toString()
    return `https://player.vimeo.com/video/${id}${query ? `?${query}` : ''}`
  }

  return null
}
