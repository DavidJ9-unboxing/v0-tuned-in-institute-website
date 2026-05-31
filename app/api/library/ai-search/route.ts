import { getCurrentUser } from '@/lib/session'
import { aiSearchLessons } from '@/lib/ai-search'

export const maxDuration = 30

export async function POST(req: Request) {
  // Members only — the library is gated.
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ error: 'Not authorized' }, { status: 401 })
  }

  let query = ''
  try {
    const body = await req.json()
    query = typeof body?.query === 'string' ? body.query : ''
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!query.trim()) {
    return Response.json({ results: [] })
  }

  try {
    const results = await aiSearchLessons(query)
    return Response.json({ results })
  } catch (err) {
    console.log('[v0] ai-search error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Search is temporarily unavailable.' }, { status: 500 })
  }
}
