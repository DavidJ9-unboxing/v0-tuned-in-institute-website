'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Star, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  addFeatured,
  updateFeatured,
  removeFeatured,
  moveFeatured,
  type ActionState,
} from '@/app/admin/actions'

type FeaturedItem = {
  featuredId: number
  lessonId: number
  position: number
  headline: string | null
  blurb: string | null
  lessonTitle: string
  lessonDescription: string | null
  kind: string
  sectionTitle: string
  sectionSlug: string
}

type LessonOption = { id: number; title: string; kind: string }
type OptionGroup = { sectionTitle: string; lessons: LessonOption[] }

const initial: ActionState = { status: 'idle', message: '' }
const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20'

const kindLabel: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  link: 'Resource',
  document: 'Document',
}

function KindBadge({ kind }: { kind: string }) {
  return (
    <span className="rounded bg-sage-light px-2 py-0.5 font-sans text-xs font-medium text-deep-teal">
      {kindLabel[kind] ?? 'Resource'}
    </span>
  )
}

export function FeaturedManager({
  items,
  options,
}: {
  items: FeaturedItem[]
  options: OptionGroup[]
}) {
  const router = useRouter()
  const [addState, addAction, addPending] = useActionState(
    async (_prev: ActionState, formData: FormData) => {
      const result = await addFeatured(formData)
      if (result.status === 'success') router.refresh()
      return result
    },
    initial,
  )

  const featuredIds = new Set(items.map((i) => i.lessonId))
  const hasOptions = options.some((g) => g.lessons.some((l) => !featuredIds.has(l.id)))

  return (
    <div className="flex flex-col gap-8">
      {/* Add a featured item */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl text-deep-teal">Feature new content</CardTitle>
        </CardHeader>
        <CardContent>
          {hasOptions ? (
            <form action={addAction} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Library content
                </label>
                <select name="lessonId" className={inputClass} required defaultValue="">
                  <option value="" disabled>
                    Choose an article, video, or document…
                  </option>
                  {options.map((group) => (
                    <optgroup key={group.sectionTitle} label={group.sectionTitle}>
                      {group.lessons
                        .filter((l) => !featuredIds.has(l.id))
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {`[${kindLabel[l.kind] ?? 'Resource'}] ${l.title}`}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                    Custom headline (optional)
                  </label>
                  <input
                    name="headline"
                    placeholder="Defaults to the content's title"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                    Custom blurb (optional)
                  </label>
                  <input
                    name="blurb"
                    placeholder="Defaults to the content's description"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={addPending} className="font-sans font-semibold">
                  {addPending ? 'Adding…' : 'Add to featured'}
                </Button>
                {addState.status !== 'idle' && (
                  <span
                    className={`font-sans text-sm ${
                      addState.status === 'error' ? 'text-destructive' : 'text-deep-teal'
                    }`}
                  >
                    {addState.message}
                  </span>
                )}
              </div>
            </form>
          ) : (
            <p className="font-sans text-sm text-muted-foreground">
              {options.length === 0
                ? 'No visible library content yet. Add content under the Content tab first.'
                : 'All available content is already featured.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Current featured list */}
      <div className="flex flex-col gap-3">
        <h2 className="font-serif text-xl font-semibold text-deep-teal">
          Currently featured{' '}
          <span className="font-sans text-sm font-normal text-muted-foreground">
            ({items.length})
          </span>
        </h2>
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center font-sans text-sm text-muted-foreground">
              Nothing featured yet. Add content above and it will appear on the resources page.
            </CardContent>
          </Card>
        ) : (
          items.map((item, index) => (
            <FeaturedRow
              key={item.featuredId}
              item={item}
              isFirst={index === 0}
              isLast={index === items.length - 1}
            />
          ))
        )}
      </div>
    </div>
  )
}

function FeaturedRow({
  item,
  isFirst,
  isLast,
}: {
  item: FeaturedItem
  isFirst: boolean
  isLast: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [editState, editAction, editPending] = useActionState(
    async (_prev: ActionState, formData: FormData) => {
      const result = await updateFeatured(formData)
      if (result.status === 'success') {
        setEditing(false)
        router.refresh()
      }
      return result
    },
    initial,
  )

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Star className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={item.kind} />
                <span className="font-sans text-xs text-muted-foreground">
                  {item.sectionTitle}
                </span>
              </div>
              <p className="font-serif text-base font-semibold text-deep-teal">
                {item.headline || item.lessonTitle}
              </p>
              <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                {item.blurb || item.lessonDescription || 'No description.'}
              </p>
              {item.headline && (
                <p className="font-sans text-xs text-muted-foreground/70">
                  Library title: {item.lessonTitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={async () => {
                await moveFeatured(item.featuredId, 'up')
                router.refresh()
              }}
              disabled={isFirst}
              aria-label="Move up"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sage-light hover:text-deep-teal disabled:opacity-30"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              onClick={async () => {
                await moveFeatured(item.featuredId, 'down')
                router.refresh()
              }}
              disabled={isLast}
              aria-label="Move down"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sage-light hover:text-deep-teal disabled:opacity-30"
            >
              <ArrowDown className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              aria-label="Edit headline and blurb"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sage-light hover:text-deep-teal"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={async () => {
                if (confirm('Remove this from the featured list? The content itself stays in the library.')) {
                  await removeFeatured(item.featuredId)
                  router.refresh()
                }
              }}
              aria-label="Remove from featured"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {editing && (
          <form action={editAction} className="flex flex-col gap-3 border-t border-border pt-3">
            <input type="hidden" name="featuredId" value={item.featuredId} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Headline
                </label>
                <input
                  name="headline"
                  defaultValue={item.headline ?? ''}
                  placeholder={item.lessonTitle}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-sm font-medium text-foreground">
                  Blurb
                </label>
                <input
                  name="blurb"
                  defaultValue={item.blurb ?? ''}
                  placeholder={item.lessonDescription ?? 'Short summary'}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={editPending} className="font-sans font-semibold">
                {editPending ? 'Saving…' : 'Save'}
              </Button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="font-sans text-sm font-medium text-muted-foreground hover:text-deep-teal"
              >
                Cancel
              </button>
              {editState.status === 'error' && (
                <span className="font-sans text-sm text-destructive">{editState.message}</span>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
