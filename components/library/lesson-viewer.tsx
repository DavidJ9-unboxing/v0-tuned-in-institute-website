'use client'

import { useState } from 'react'
import { Download, ExternalLink, FileText, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/lib/content'
import { toEmbedUrl } from '@/lib/video'

/** PDFs can be previewed inline; other document types only offer a download. */
function isPdf(url: string, fileName?: string | null) {
  const target = (fileName || url).split('?')[0].toLowerCase()
  return target.endsWith('.pdf')
}

export function LessonViewer({
  lessons,
  initialLessonId,
}: {
  lessons: Lesson[]
  initialLessonId?: number
}) {
  const initial =
    lessons.find((l) => l.id === initialLessonId) ?? lessons[0] ?? null
  const [activeId, setActiveId] = useState<number | null>(initial?.id ?? null)
  const active = lessons.find((l) => l.id === activeId) ?? null

  if (lessons.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone bg-card px-6 py-12 text-center font-serif text-[15px] text-charcoal/70">
        No lessons have been added to this collection yet.
      </p>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Main viewer */}
      <div className="order-1 flex flex-col gap-5">
        {active && (
          <>
            {active.kind === 'video' && active.videoUrl ? (
              <div className="overflow-hidden rounded-2xl border border-stone bg-charcoal">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  key={active.id}
                  src={`/api/library/file/${active.id}`}
                  controls
                  controlsList="nodownload"
                  className="aspect-video w-full bg-charcoal"
                />
              </div>
            ) : active.kind === 'video' ? (
              <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-stone bg-sage-light">
                <p className="font-serif text-[15px] text-charcoal/60">
                  This video is not available yet.
                </p>
              </div>
            ) : null}

            {active.kind === 'embed' &&
              (toEmbedUrl(active.externalUrl ?? '') ? (
                <div className="overflow-hidden rounded-2xl border border-stone bg-charcoal">
                  <iframe
                    key={active.id}
                    src={toEmbedUrl(active.externalUrl ?? '') as string}
                    title={active.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="aspect-video w-full bg-charcoal"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-stone bg-sage-light">
                  <p className="font-serif text-[15px] text-charcoal/60">
                    This video is not available yet.
                  </p>
                </div>
              ))}

            {active.kind === 'link' && active.externalUrl && (
              <div className="flex flex-col items-start gap-4 rounded-2xl border border-stone bg-sage-light px-6 py-8">
                <p className="font-serif text-[15px] leading-relaxed text-charcoal/75">
                  This resource opens on an external page.
                </p>
                <a
                  href={active.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 font-sans text-sm font-semibold text-off-white transition-colors hover:bg-deep-teal/90"
                >
                  Open resource
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </div>
            )}

            {active.kind === 'document' && active.fileUrl && (
              <div className="flex flex-col gap-4">
                {isPdf(active.fileUrl, active.fileName) && (
                  <div className="overflow-hidden rounded-2xl border border-stone bg-card">
                    <iframe
                      key={active.id}
                      src={`/api/library/file/${active.id}`}
                      title={active.title}
                      className="h-[70vh] w-full"
                    />
                  </div>
                )}
                <a
                  href={`/api/library/file/${active.id}?download=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 font-sans text-sm font-semibold text-off-white transition-colors hover:bg-deep-teal/90"
                >
                  {isPdf(active.fileUrl, active.fileName) ? 'Download' : 'Open document'}
                  <Download className="size-4" aria-hidden="true" />
                </a>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <h2 className="font-serif text-2xl font-semibold text-deep-teal text-balance">
                {active.title}
              </h2>
              {active.description && (
                <p className="font-serif text-[16px] leading-relaxed text-charcoal/80">
                  {active.description}
                </p>
              )}
              {active.kind === 'article' && active.body && (
                <article className="mt-2 whitespace-pre-wrap font-serif text-[16px] leading-relaxed text-charcoal/85">
                  {active.body}
                </article>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lesson list */}
      <aside className="order-2 flex flex-col gap-2 lg:border-l lg:border-stone lg:pl-6">
        <h3 className="mb-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/55">
          {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
        </h3>
        <ol className="flex flex-col gap-1.5">
          {lessons.map((l, i) => {
            const isActive = l.id === activeId
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(l.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    isActive
                      ? 'border-deep-teal/40 bg-sage-light'
                      : 'border-stone bg-card hover:border-deep-teal/30',
                  )}
                >
                  <span className="mt-0.5 shrink-0">
                    {l.kind === 'article' ? (
                      <FileText className="size-4 text-sage-deep" aria-hidden="true" />
                    ) : l.kind === 'link' ? (
                      <ExternalLink className="size-4 text-sage-deep" aria-hidden="true" />
                    ) : l.kind === 'document' ? (
                      <Download className="size-4 text-sage-deep" aria-hidden="true" />
                    ) : (
                      <PlayCircle className="size-4 text-deep-teal" aria-hidden="true" />
                    )}
                    {/* video + embed both use the play icon above */}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-serif text-[15px] font-semibold leading-snug text-charcoal">
                      {i + 1}. {l.title}
                    </span>
                    <span className="font-sans text-[11px] uppercase tracking-wide text-charcoal/45">
                      {l.kind === 'article'
                        ? 'Article'
                        : l.kind === 'link'
                          ? 'Link'
                          : l.kind === 'document'
                            ? 'Document'
                            : 'Video'}
                      {/* "video" and "embed" both display as Video */}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </aside>
    </div>
  )
}
