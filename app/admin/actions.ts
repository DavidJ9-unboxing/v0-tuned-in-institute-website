'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { lesson, section, user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'

export type ActionState = { status: 'idle' | 'success' | 'error'; message: string }

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// --- Accounts --------------------------------------------------------------

export async function createClientAccount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const role = String(formData.get('role') ?? 'client')

  if (!name || !email || password.length < 8) {
    return { status: 'error', message: 'Name, email, and a password of at least 8 characters are required.' }
  }

  try {
    await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: role === 'admin' ? 'admin' : 'client',
      },
    })
    // Admin-created accounts are trusted, so mark the email as verified.
    // The client can sign in immediately with the password you set — no
    // verification email required.
    await db.update(user).set({ emailVerified: true }).where(eq(user.email, email))
    revalidatePath('/admin/accounts')
    return {
      status: 'success',
      message: `Account created for ${email}. They can sign in now with the password you set.`,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create the account.'
    return { status: 'error', message }
  }
}

export async function changeUserRole(userId: string, role: 'admin' | 'client') {
  await requireAdmin()
  await auth.api.setUserRole({ body: { userId, role } })
  revalidatePath('/admin/accounts')
}

export async function removeUser(userId: string) {
  const admin = await requireAdmin()
  if (admin.id === userId) return // never delete yourself
  await auth.api.removeUser({ body: { userId } })
  revalidatePath('/admin/accounts')
}

// --- Sections --------------------------------------------------------------

export async function createSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  if (!title) return { status: 'error', message: 'A title is required.' }

  let slug = slugify(title)
  if (!slug) slug = `section-${Date.now()}`

  try {
    const existing = await db.select().from(section).where(eq(section.slug, slug)).limit(1)
    if (existing.length) slug = `${slug}-${Date.now().toString().slice(-4)}`

    const allSections = await db.select({ position: section.position }).from(section)
    const position = allSections.reduce((max, s) => Math.max(max, s.position), 0) + 1

    await db.insert(section).values({
      slug,
      title,
      description: description || null,
      position,
    })
    revalidatePath('/admin/content')
    revalidatePath('/library')
    return { status: 'success', message: `Collection "${title}" created.` }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create the collection.'
    return { status: 'error', message }
  }
}

export async function updateSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const sectionId = Number(formData.get('sectionId'))
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  if (!sectionId || !title) {
    return { status: 'error', message: 'A title is required.' }
  }
  try {
    await db
      .update(section)
      .set({ title, description: description || null })
      .where(eq(section.id, sectionId))
    revalidatePath('/admin/content')
    revalidatePath('/library')
    return { status: 'success', message: 'Collection updated.' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update the collection.'
    return { status: 'error', message }
  }
}

/** Move a single lesson to a different collection, appended to the end. */
export async function moveLesson(lessonId: number, targetSectionId: number) {
  await requireAdmin()
  const existing = await db
    .select({ id: lesson.id })
    .from(lesson)
    .where(eq(lesson.sectionId, targetSectionId))
  await db
    .update(lesson)
    .set({ sectionId: targetSectionId, position: existing.length + 1 })
    .where(eq(lesson.id, lessonId))
  revalidatePath('/admin/content')
  revalidatePath('/library')
}

export async function deleteSection(sectionId: number) {
  await requireAdmin()
  // Remove blobs for any videos in this section first.
  const lessons = await db.select().from(lesson).where(eq(lesson.sectionId, sectionId))
  await Promise.allSettled(
    lessons.filter((l) => l.videoUrl).map((l) => del(l.videoUrl as string)),
  )
  await db.delete(lesson).where(eq(lesson.sectionId, sectionId))
  await db.delete(section).where(eq(section.id, sectionId))
  revalidatePath('/admin/content')
  revalidatePath('/library')
}

// --- Lessons ---------------------------------------------------------------

export async function createLesson(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const sectionId = Number(formData.get('sectionId'))
  const kind = String(formData.get('kind') ?? 'video')
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const videoUrl = String(formData.get('videoUrl') ?? '').trim()
  const externalUrl = String(formData.get('externalUrl') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()

  if (!sectionId || !title) {
    return { status: 'error', message: 'A collection and title are required.' }
  }
  if (kind === 'video' && !videoUrl) {
    return { status: 'error', message: 'Please upload a video before saving.' }
  }
  if (kind === 'article' && !body) {
    return { status: 'error', message: 'Article body cannot be empty.' }
  }
  if (kind === 'link' && !isValidUrl(externalUrl)) {
    return { status: 'error', message: 'Please enter a valid link starting with https://' }
  }

  try {
    const existing = await db.select().from(lesson).where(eq(lesson.sectionId, sectionId))
    const position = existing.length + 1
    await db.insert(lesson).values({
      sectionId,
      kind: kind === 'article' ? 'article' : kind === 'link' ? 'link' : 'video',
      title,
      description: description || null,
      videoUrl: kind === 'video' ? videoUrl : null,
      body: kind === 'article' ? body : null,
      externalUrl: kind === 'link' ? externalUrl : null,
      position,
    })
    revalidatePath('/admin/content')
    revalidatePath('/library')
    return { status: 'success', message: `Lesson "${title}" added.` }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not add the lesson.'
    return { status: 'error', message }
  }
}

function isValidUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Bulk-import a list of external links (e.g. course transcripts, blog posts)
 * into a collection. Admins paste one item per line as either:
 *   Title | https://example.com/page
 * or just a URL on its own (a title is derived from the URL).
 * If `newSectionTitle` is provided, a new collection is created; otherwise the
 * lessons are appended to the selected existing collection.
 */
export async function bulkImportLinks(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const rawLines = String(formData.get('lines') ?? '')
  const existingSectionId = Number(formData.get('sectionId') ?? 0)
  const newSectionTitle = String(formData.get('newSectionTitle') ?? '').trim()
  const newSectionDescription = String(formData.get('newSectionDescription') ?? '').trim()

  // Parse the pasted lines into { title, url } items.
  const items: { title: string; url: string }[] = []
  for (const line of rawLines.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // Split on the first | or tab; fall back to "url only".
    const sep = trimmed.search(/[|\t]/)
    let title = ''
    let url = ''
    if (sep >= 0) {
      title = trimmed.slice(0, sep).trim()
      url = trimmed.slice(sep + 1).trim()
    } else {
      url = trimmed
    }
    if (!isValidUrl(url)) continue
    if (!title) title = titleFromUrl(url)
    items.push({ title, url })
  }

  if (items.length === 0) {
    return {
      status: 'error',
      message: 'No valid links found. Add one link per line (titles are optional).',
    }
  }

  try {
    // Resolve the target collection.
    let sectionId = existingSectionId
    if (newSectionTitle) {
      let slug = slugify(newSectionTitle) || `section-${Date.now()}`
      const dupe = await db.select().from(section).where(eq(section.slug, slug)).limit(1)
      if (dupe.length) slug = `${slug}-${Date.now().toString().slice(-4)}`
      const allSections = await db.select({ position: section.position }).from(section)
      const position = allSections.reduce((max, s) => Math.max(max, s.position), 0) + 1
      const [created] = await db
        .insert(section)
        .values({
          slug,
          title: newSectionTitle,
          description: newSectionDescription || null,
          position,
        })
        .returning({ id: section.id })
      sectionId = created.id
    }

    if (!sectionId) {
      return { status: 'error', message: 'Choose an existing collection or name a new one.' }
    }

    const existing = await db.select({ id: lesson.id }).from(lesson).where(eq(lesson.sectionId, sectionId))
    let position = existing.length
    await db.insert(lesson).values(
      items.map((it) => ({
        sectionId,
        kind: 'link',
        title: it.title,
        externalUrl: it.url,
        position: ++position,
      })),
    )

    revalidatePath('/admin/content')
    revalidatePath('/library')
    return {
      status: 'success',
      message: `Imported ${items.length} ${items.length === 1 ? 'link' : 'links'}.`,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not import the links.'
    return { status: 'error', message }
  }
}

function titleFromUrl(url: string) {
  try {
    const { pathname } = new URL(url)
    const last = pathname.split('/').filter(Boolean).pop() ?? url
    const words = decodeURIComponent(last)
      .replace(/[-_]+/g, ' ')
      .replace(/\.[a-z0-9]+$/i, '')
      .trim()
    if (!words) return url
    return words.replace(/\b\w/g, (c) => c.toUpperCase())
  } catch {
    return url
  }
}

export async function deleteLesson(lessonId: number) {
  await requireAdmin()
  const [row] = await db.select().from(lesson).where(eq(lesson.id, lessonId)).limit(1)
  if (row?.videoUrl) {
    await del(row.videoUrl).catch(() => {})
  }
  await db.delete(lesson).where(eq(lesson.id, lessonId))
  revalidatePath('/admin/content')
  revalidatePath('/library')
}
