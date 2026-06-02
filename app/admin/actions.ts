'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { lesson, section, user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'
import { toEmbedUrl } from '@/lib/video'
import { sendWelcomeEmail } from '@/lib/email'

export type ActionState = { status: 'idle' | 'success' | 'error'; message: string }

/** Absolute base URL of the app, used to build links in emails. */
function appBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')
  )
}

/**
 * Builds a temporary password: first name + first initial of last name +
 * five random digits (e.g. "JaneD48217"). Falls back gracefully when a name
 * has only one word, and pads to satisfy the 8-character minimum.
 */
function generateTempPassword(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const first = (parts[0] ?? 'member').replace(/[^a-zA-Z]/g, '')
  const lastInitial = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''
  const base = `${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()}${lastInitial.toUpperCase()}`
  let digits = String(Math.floor(10000 + Math.random() * 90000)) // always 5 digits
  let password = `${base}${digits}`
  // Guarantee the 8-char minimum even for very short names.
  while (password.length < 8) {
    digits += Math.floor(Math.random() * 10)
    password = `${base}${digits}`
  }
  return password
}

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
  const role = String(formData.get('role') ?? 'client')

  if (!name || !email) {
    return { status: 'error', message: 'A name and email are required.' }
  }

  // Auto-generate a temporary password — the admin never types one.
  const password = generateTempPassword(name)

  try {
    await auth.api.createUser({
      body: {
        name,
        email,
        password,
        // The admin plugin's static types only know the built-in roles, but at
        // runtime our custom "client" role is valid (it's the configured
        // defaultRole). Cast to satisfy the type checker.
        role: (role === 'admin' ? 'admin' : 'client') as 'admin',
      },
    })
    // Admin-created accounts are trusted, so mark the email as verified, and
    // flag the account so the member is prompted to choose their own password
    // after their first sign-in with the temporary one.
    await db
      .update(user)
      .set({ emailVerified: true, mustChangePassword: true })
      .where(eq(user.email, email))

    // Email the new member their credentials automatically.
    const signInUrl = `${appBaseUrl()}/sign-in`
    const sent = await sendWelcomeEmail({ to: email, name, email, tempPassword: password, signInUrl })

    revalidatePath('/admin/accounts')
    return {
      status: 'success',
      message: sent.ok
        ? `Account created. A welcome email with the temporary password was sent to ${email}.`
        : `Account created, but the welcome email could not be sent (${sent.error}). Temporary password: ${password}`,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create the account.'
    return { status: 'error', message }
  }
}

export async function changeUserRole(userId: string, role: 'admin' | 'client') {
  await requireAdmin()
  await auth.api.setRole({
    body: { userId, role: role as 'admin' },
    headers: await headers(),
  })
  revalidatePath('/admin/accounts')
}

export async function removeUser(userId: string): Promise<ActionState> {
  const admin = await requireAdmin()
  if (admin.id === userId) {
    return { status: 'error', message: 'You cannot delete your own account.' }
  }

  try {
    // Delete directly from the database. The Better Auth admin `removeUser`
    // endpoint was leaving the row in place (its session-based authorization
    // can silently reject the call), so we own the deletion here. The session
    // and account tables both cascade on `user.id`, so those rows are removed
    // automatically.
    const deleted = await db
      .delete(user)
      .where(eq(user.id, userId))
      .returning({ id: user.id })

    if (deleted.length === 0) {
      return { status: 'error', message: 'That account no longer exists.' }
    }

    revalidatePath('/admin/accounts')
    return { status: 'success', message: 'Account removed.' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not remove the account.'
    console.error('[v0] removeUser failed:', message)
    return { status: 'error', message }
  }
}

// --- Sections --------------------------------------------------------------

export async function createSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const hidden = formData.get('hidden') === 'true'
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
      hidden,
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
  const hidden = formData.get('hidden') === 'true'
  if (!sectionId || !title) {
    return { status: 'error', message: 'A title is required.' }
  }
  try {
    await db
      .update(section)
      .set({ title, description: description || null, hidden })
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
    lessons
      .flatMap((l) => [l.videoUrl, l.fileUrl])
      .filter((url): url is string => Boolean(url))
      .map((url) => del(url)),
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
  const fileUrl = String(formData.get('fileUrl') ?? '').trim()
  const fileName = String(formData.get('fileName') ?? '').trim()
  const hidden = formData.get('hidden') === 'true'

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
  if (kind === 'embed') {
    if (!isValidUrl(externalUrl)) {
      return { status: 'error', message: 'Please enter a valid link starting with https://' }
    }
    if (!toEmbedUrl(externalUrl)) {
      return {
        status: 'error',
        message: 'That doesn’t look like a YouTube or Vimeo link. Paste the video’s share URL.',
      }
    }
  }
  if (kind === 'document' && !fileUrl) {
    return { status: 'error', message: 'Please upload a document before saving.' }
  }

  const normalizedKind =
    kind === 'article'
      ? 'article'
      : kind === 'link'
        ? 'link'
        : kind === 'embed'
          ? 'embed'
          : kind === 'document'
            ? 'document'
            : 'video'

  try {
    const existing = await db.select().from(lesson).where(eq(lesson.sectionId, sectionId))
    const position = existing.length + 1
    await db.insert(lesson).values({
      sectionId,
      kind: normalizedKind,
      title,
      description: description || null,
      videoUrl: kind === 'video' ? videoUrl : null,
      body: kind === 'article' ? body : null,
      externalUrl: kind === 'link' || kind === 'embed' ? externalUrl : null,
      fileUrl: kind === 'document' ? fileUrl : null,
      fileName: kind === 'document' ? fileName || null : null,
      hidden,
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

/**
 * Edit an existing lesson's title, description, hidden flag, and the one
 * content field that matches its kind (the embed/link URL, or the article
 * body). The lesson kind itself isn't changed here. This is what lets an admin
 * paste a Vimeo/YouTube link into a video placeholder after the fact.
 */
export async function updateLesson(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const lessonId = Number(formData.get('lessonId'))
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const externalUrl = String(formData.get('externalUrl') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  const hidden = formData.get('hidden') === 'true'

  if (!lessonId || !title) {
    return { status: 'error', message: 'A title is required.' }
  }

  const [row] = await db.select().from(lesson).where(eq(lesson.id, lessonId)).limit(1)
  if (!row) {
    return { status: 'error', message: 'That lesson no longer exists.' }
  }

  const updates: Partial<typeof lesson.$inferInsert> = {
    title,
    description: description || null,
    hidden,
  }

  if (row.kind === 'embed') {
    // Allow saving an empty URL so a placeholder can stay empty; only validate
    // when a value is provided.
    if (externalUrl) {
      if (!isValidUrl(externalUrl)) {
        return { status: 'error', message: 'Please enter a valid link starting with https://' }
      }
      if (!toEmbedUrl(externalUrl)) {
        return {
          status: 'error',
          message: 'That doesn’t look like a YouTube or Vimeo link. Paste the video’s share URL.',
        }
      }
    }
    updates.externalUrl = externalUrl || null
  } else if (row.kind === 'link') {
    if (externalUrl && !isValidUrl(externalUrl)) {
      return { status: 'error', message: 'Please enter a valid link starting with https://' }
    }
    updates.externalUrl = externalUrl || null
  } else if (row.kind === 'article') {
    if (!body) {
      return { status: 'error', message: 'Article body cannot be empty.' }
    }
    updates.body = body
  }

  try {
    await db.update(lesson).set(updates).where(eq(lesson.id, lessonId))
    revalidatePath('/admin/content')
    revalidatePath('/library')
    return { status: 'success', message: `Lesson "${title}" updated.` }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update the lesson.'
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
  const hidden = formData.get('hidden') === 'true'

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
          hidden,
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
        hidden,
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
  if (row?.fileUrl) {
    await del(row.fileUrl).catch(() => {})
  }
  await db.delete(lesson).where(eq(lesson.id, lessonId))
  revalidatePath('/admin/content')
  revalidatePath('/library')
}
