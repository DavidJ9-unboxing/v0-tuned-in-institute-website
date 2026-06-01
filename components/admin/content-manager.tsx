'use client'

import { useActionState, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createSection,
  createLesson,
  deleteSection,
  deleteLesson,
  updateSection,
  updateLesson,
  moveLesson,
  bulkImportLinks,
  type ActionState,
} from '@/app/admin/actions'

type Lesson = {
  id: number
  kind: string
  title: string
  description: string | null
  externalUrl: string | null
  body: string | null
  hidden: boolean
  position: number
}

type Section = {
  id: number
  slug: string
  title: string
  description: string | null
  hidden: boolean
  lessons: Lesson[]
}

const initial: ActionState = { status: 'idle', message: '' }
const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20'

/** A small "Hidden from library" badge shown in the admin index. */
function HiddenBadge() {
  return (
    <span className="rounded bg-amber-100 px-2 py-0.5 font-sans text-xs font-medium text-amber-800">
      Hidden · Remi only
    </span>
  )
}

/**
 * Checkbox that flags content as hidden from the library (Remi knowledge only).
 * Submitted as the `hidden` field with value "true" when checked.
 */
function HiddenToggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="flex items-start gap-2 font-sans text-sm text-foreground">
      <input
        type="checkbox"
        name="hidden"
        value="true"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 rounded border-input accent-deep-teal"
      />
      <span>
        Hide from library{' '}
        <span className="text-muted-foreground">
          — members won&apos;t see it, but Remi can use it to answer questions.
        </span>
      </span>
    </label>
  )
}

export function ContentManager({ sections }: { sections: Section[] }) {
  const router = useRouter()
  const [sectionState, sectionAction, sectionPending] = useActionState(createSection, initial)

  return (
    <div className="flex flex-col gap-8">
      {/* Create collection */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl text-deep-teal">New collection</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={sectionAction} className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Title
                </label>
                <input name="title" placeholder="Tuned In Teens" className={inputClass} required />
              </div>
              <div className="flex-1">
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Description (optional)
                </label>
                <input
                  name="description"
                  placeholder="Short summary of this collection"
                  className={inputClass}
                />
              </div>
              <Button type="submit" disabled={sectionPending} className="font-sans font-semibold">
                {sectionPending ? 'Creating…' : 'Create'}
              </Button>
            </div>
            <HiddenToggle />
          </form>
          {sectionState.status !== 'idle' && (
            <p
              className={`mt-2 font-sans text-sm ${
                sectionState.status === 'error' ? 'text-destructive' : 'text-deep-teal'
              }`}
            >
              {sectionState.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bulk import links */}
      <BulkImport sections={sections} onDone={() => router.refresh()} />

      {sections.length === 0 ? (
        <p className="font-sans text-sm text-muted-foreground">
          No collections yet. Create your first one above.
        </p>
      ) : (
        sections.map((s) => (
          <SectionCard
            key={s.id}
            section={s}
            sections={sections}
            onDone={() => router.refresh()}
          />
        ))
      )}
    </div>
  )
}

function SectionCard({
  section,
  sections,
  onDone,
}: {
  section: Section
  sections: Section[]
  onDone: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updateSection, initial)
  const lastStatus = useRef(state.status)

  if (state.status === 'success' && lastStatus.current !== 'success') {
    lastStatus.current = 'success'
    setEditing(false)
    onDone()
  } else if (state.status !== 'success') {
    lastStatus.current = state.status
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        {editing ? (
          <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="sectionId" value={section.id} />
            <div className="flex flex-col gap-1">
              <label className="font-sans text-xs font-medium text-muted-foreground">
                Collection name
              </label>
              <input name="title" defaultValue={section.title} className={inputClass} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-sans text-xs font-medium text-muted-foreground">
                Description (optional)
              </label>
              <input
                name="description"
                defaultValue={section.description ?? ''}
                placeholder="Short summary of this collection"
                className={inputClass}
              />
            </div>
            <HiddenToggle defaultChecked={section.hidden} />
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pending} className="font-sans font-semibold">
                {pending ? 'Saving…' : 'Save'}
              </Button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="font-sans text-sm font-medium text-muted-foreground hover:underline"
              >
                Cancel
              </button>
              {state.status === 'error' && (
                <span className="font-sans text-sm text-destructive">{state.message}</span>
              )}
            </div>
          </form>
        ) : (
          <div className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex flex-wrap items-center gap-x-2 gap-y-1 font-serif text-xl text-deep-teal">
                {section.title}
                <span className="font-sans text-sm font-normal text-muted-foreground">
                  {section.lessons.length}{' '}
                  {section.lessons.length === 1 ? 'item' : 'items'}
                </span>
                {section.hidden && <HiddenBadge />}
              </CardTitle>
              {section.description && (
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  {section.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <button
                onClick={() => setEditing(true)}
                className="font-sans text-sm font-medium text-deep-teal hover:underline"
              >
                Rename
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete "${section.title}" and all its lessons?`)) {
                    await deleteSection(section.id)
                    onDone()
                  }
                }}
                className="font-sans text-sm font-medium text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {section.lessons.length > 0 && (
          <ul className="flex flex-col gap-2">
            {section.lessons.map((l) => (
              <LessonRow
                key={l.id}
                lesson={l}
                section={section}
                sections={sections}
                onDone={onDone}
              />
            ))}
          </ul>
        )}
        <AddLessonForm sectionId={section.id} onDone={onDone} />
      </CardContent>
    </Card>
  )
}

/** A single lesson row in the admin index, with inline edit + move + remove. */
function LessonRow({
  lesson,
  section,
  sections,
  onDone,
}: {
  lesson: Lesson
  section: Section
  sections: Section[]
  onDone: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updateLesson, initial)
  const lastStatus = useRef(state.status)

  if (state.status === 'success' && lastStatus.current !== 'success') {
    lastStatus.current = 'success'
    setEditing(false)
    onDone()
  } else if (state.status !== 'success') {
    lastStatus.current = state.status
  }

  // Only embed/link/article lessons have a content field that can be edited
  // here. Uploaded videos and documents can't be re-uploaded inline — remove
  // and re-add those if the file needs to change.
  const editableContent =
    lesson.kind === 'embed' || lesson.kind === 'link' || lesson.kind === 'article'

  if (editing) {
    return (
      <li className="rounded-md border border-deep-teal/40 bg-background px-3 py-3">
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <div className="flex flex-col gap-1">
            <label className="font-sans text-xs font-medium text-muted-foreground">Title</label>
            <input name="title" defaultValue={lesson.title} className={inputClass} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-sans text-xs font-medium text-muted-foreground">
              Description (optional)
            </label>
            <input
              name="description"
              defaultValue={lesson.description ?? ''}
              placeholder="Short description (shown in the index)"
              className={inputClass}
            />
          </div>

          {lesson.kind === 'embed' && (
            <div className="flex flex-col gap-1">
              <label className="font-sans text-xs font-medium text-muted-foreground">
                Video link (YouTube or Vimeo)
              </label>
              <input
                name="externalUrl"
                type="url"
                defaultValue={lesson.externalUrl ?? ''}
                placeholder="https://vimeo.com/123456789/abcdef or https://youtu.be/…"
                className={inputClass}
              />
              <p className="font-sans text-xs leading-relaxed text-muted-foreground">
                Paste the share link and the video plays right inside the lesson. Leave blank to keep
                this a placeholder until the video is ready.
              </p>
            </div>
          )}
          {lesson.kind === 'link' && (
            <div className="flex flex-col gap-1">
              <label className="font-sans text-xs font-medium text-muted-foreground">Link URL</label>
              <input
                name="externalUrl"
                type="url"
                defaultValue={lesson.externalUrl ?? ''}
                placeholder="https://example.com/transcript"
                className={inputClass}
              />
            </div>
          )}
          {lesson.kind === 'article' && (
            <div className="flex flex-col gap-1">
              <label className="font-sans text-xs font-medium text-muted-foreground">
                Article body
              </label>
              <textarea
                name="body"
                rows={5}
                defaultValue={lesson.body ?? ''}
                className={inputClass}
              />
            </div>
          )}

          <HiddenToggle defaultChecked={lesson.hidden} />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending} className="font-sans font-semibold">
              {pending ? 'Saving…' : 'Save'}
            </Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="font-sans text-sm font-medium text-muted-foreground hover:underline"
            >
              Cancel
            </button>
            {state.status === 'error' && (
              <span className="font-sans text-sm text-destructive">{state.message}</span>
            )}
          </div>
        </form>
      </li>
    )
  }

  const isEmptyPlaceholder = lesson.kind === 'embed' && !lesson.externalUrl

  return (
    <li className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-sage-light px-2 py-0.5 font-sans text-xs font-medium text-deep-teal">
          {lesson.kind}
        </span>
        <span className="font-sans text-sm text-foreground">{lesson.title}</span>
        {isEmptyPlaceholder && (
          <span className="rounded bg-amber-100 px-2 py-0.5 font-sans text-xs font-medium text-amber-800">
            Needs video link
          </span>
        )}
        {lesson.hidden && <HiddenBadge />}
      </div>
      <div className="flex items-center gap-3 sm:shrink-0">
        {editableContent && (
          <button
            onClick={() => setEditing(true)}
            className="font-sans text-xs font-medium text-deep-teal hover:underline"
          >
            Edit
          </button>
        )}
        <label className="sr-only" htmlFor={`move-${lesson.id}`}>
          Move {lesson.title} to another collection
        </label>
        <select
          id={`move-${lesson.id}`}
          defaultValue=""
          onChange={async (e) => {
            const target = Number(e.target.value)
            if (!target) return
            await moveLesson(lesson.id, target)
            onDone()
          }}
          className="rounded-md border border-input bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20"
        >
          <option value="">Move to…</option>
          {sections
            .filter((other) => other.id !== section.id)
            .map((other) => (
              <option key={other.id} value={other.id}>
                {other.title}
              </option>
            ))}
        </select>
        <button
          onClick={async () => {
            if (confirm(`Delete lesson "${lesson.title}"?`)) {
              await deleteLesson(lesson.id)
              onDone()
            }
          }}
          className="font-sans text-xs font-medium text-destructive hover:underline"
        >
          Remove
        </button>
      </div>
    </li>
  )
}

function BulkImport({ sections, onDone }: { sections: Section[]; onDone: () => void }) {
  const NEW = '__new__'
  const [target, setTarget] = useState<string>(sections[0] ? String(sections[0].id) : NEW)
  const [state, formAction, pending] = useActionState(bulkImportLinks, initial)
  const formRef = useRef<HTMLFormElement>(null)
  const lastStatus = useRef(state.status)

  if (state.status === 'success' && lastStatus.current !== 'success') {
    lastStatus.current = 'success'
    formRef.current?.reset()
    setTarget(sections[0] ? String(sections[0].id) : NEW)
    onDone()
  } else if (state.status !== 'success') {
    lastStatus.current = state.status
  }

  const creatingNew = target === NEW

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl text-deep-teal">Bulk import links</CardTitle>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Paste one link per line. Add an optional title before a “|”, e.g.{' '}
          <span className="font-mono text-xs">Module 1 | https://example.com/module-1</span>. Links
          open on their original page.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} ref={formRef} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                Add to collection
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                name="sectionId"
                className={inputClass}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
                <option value={NEW}>+ New collection…</option>
              </select>
            </div>
            {creatingNew && (
              <div className="flex-1">
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  New collection name
                </label>
                <input
                  name="newSectionTitle"
                  placeholder="Course Transcripts"
                  className={inputClass}
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block font-sans text-sm font-medium text-foreground">
              Links
            </label>
            <textarea
              name="lines"
              rows={6}
              placeholder={'Module 1 | https://www.example.com/module-1\nhttps://www.example.com/module-2'}
              className={`${inputClass} font-mono text-xs`}
              required
            />
          </div>

          <HiddenToggle />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending} className="font-sans font-semibold">
              {pending ? 'Importing…' : 'Import links'}
            </Button>
            {state.status !== 'idle' && (
              <span
                className={`font-sans text-sm ${
                  state.status === 'error' ? 'text-destructive' : 'text-deep-teal'
                }`}
              >
                {state.message}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

type LessonKind = 'video' | 'embed' | 'document' | 'article' | 'link'

const KIND_LABELS: Record<LessonKind, string> = {
  video: 'Upload video',
  embed: 'Video link',
  document: 'Document',
  article: 'Article',
  link: 'Link',
}

function AddLessonForm({ sectionId, onDone }: { sectionId: number; onDone: () => void }) {
  const [kind, setKind] = useState<LessonKind>('embed')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [state, formAction, pending] = useActionState(createLesson, initial)
  const formRef = useRef<HTMLFormElement>(null)
  const lastStatus = useRef(state.status)

  // Reset on successful save.
  if (state.status === 'success' && lastStatus.current !== 'success') {
    lastStatus.current = 'success'
    setUploadedUrl('')
    setFileName('')
    formRef.current?.reset()
    onDone()
  } else if (state.status !== 'success') {
    lastStatus.current = state.status
  }

  function selectKind(k: LessonKind) {
    // Uploaded files are kind-specific, so clear them when switching modes.
    setKind(k)
    setUploadedUrl('')
    setFileName('')
    setUploadError('')
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    setProgress(0)
    try {
      // Only use multipart for large files (e.g. videos). It splits the upload
      // into parallel chunks, which is faster and more resilient for big files,
      // but adds extra round trips that slow down small files like PDFs — so a
      // single-shot upload is faster there.
      const useMultipart = file.size > 50 * 1024 * 1024 // 50 MB
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload',
        multipart: useMultipart,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })
      setUploadedUrl(blob.url)
      setFileName(file.name)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-md border border-dashed border-border p-4"
    >
      <p className="font-sans text-sm font-semibold text-foreground">Add a lesson</p>
      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="videoUrl" value={kind === 'video' ? uploadedUrl : ''} />
      <input type="hidden" name="fileUrl" value={kind === 'document' ? uploadedUrl : ''} />
      <input type="hidden" name="fileName" value={kind === 'document' ? fileName : ''} />

      <div className="flex flex-wrap gap-2">
        {(['embed', 'video', 'document', 'article', 'link'] as const).map((k) => (
          <button
            type="button"
            key={k}
            onClick={() => selectKind(k)}
            className={`rounded-md px-3 py-1.5 font-sans text-sm font-medium transition-colors ${
              kind === k
                ? 'bg-deep-teal text-off-white'
                : 'bg-muted text-muted-foreground hover:bg-sage-light'
            }`}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <input name="title" placeholder="Lesson title" className={inputClass} required />
      <input
        name="description"
        placeholder="Short description (shown in the index)"
        className={inputClass}
      />

      {kind === 'video' || kind === 'document' ? (
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept={
              kind === 'video'
                ? 'video/*'
                : '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv'
            }
            onChange={handleFile}
            className="block w-full font-sans text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-sage-light file:px-3 file:py-2 file:font-sans file:text-sm file:font-semibold file:text-deep-teal"
          />
          {kind === 'document' && (
            <p className="font-sans text-xs text-muted-foreground">
              PDF, Word, PowerPoint, Excel, or text files.
            </p>
          )}
          {uploading && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-sans text-xs text-muted-foreground">
                <span>{progress < 100 ? 'Uploading…' : 'Finishing up…'}</span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-deep-teal transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="font-sans text-[11px] text-muted-foreground">
                Large videos can take several minutes — you can leave this tab open.
              </p>
            </div>
          )}
          {fileName && !uploading && (
            <p className="font-sans text-xs text-deep-teal">Uploaded: {fileName}</p>
          )}
          {uploadError && <p className="font-sans text-xs text-destructive">{uploadError}</p>}
        </div>
      ) : kind === 'embed' ? (
        <div className="flex flex-col gap-2">
          <input
            name="externalUrl"
            type="url"
            placeholder="https://vimeo.com/123456789/abcdef or https://youtu.be/…"
            className={inputClass}
          />
          <p className="font-sans text-xs leading-relaxed text-muted-foreground">
            Paste a YouTube or Vimeo share link and the video plays right inside the lesson — ideal
            for long lessons. To keep it private, set the video to{' '}
            <span className="font-medium text-foreground">Unlisted</span> on YouTube, or{' '}
            <span className="font-medium text-foreground">
              Private with “hide from Vimeo” and link-only access
            </span>{' '}
            on Vimeo, then copy that share URL here.
          </p>
        </div>
      ) : kind === 'link' ? (
        <input
          name="externalUrl"
          type="url"
          placeholder="https://example.com/transcript"
          className={inputClass}
        />
      ) : (
        <textarea
          name="body"
          rows={5}
          placeholder="Write the article content here…"
          className={inputClass}
        />
      )}

      <HiddenToggle />

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={
            pending ||
            uploading ||
            ((kind === 'video' || kind === 'document') && !uploadedUrl)
          }
          className="font-sans font-semibold"
        >
          {pending ? 'Saving…' : 'Add lesson'}
        </Button>
        {state.status === 'error' && (
          <span className="font-sans text-sm text-destructive">{state.message}</span>
        )}
      </div>
    </form>
  )
}
