'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toEmbedUrl } from '@/lib/video'

// Some PDFs are full books with a real cover we can show as the tappable
// preview instead of a generic icon. Keyed by stored file name.
const DOCUMENT_COVERS: Record<string, { src: string; label: string }> = {
  'Tuned In - A Guide for Parents of Sensitive Children.pdf': {
    src: '/images/tuned-in-book-cover.png',
    label: 'Tuned In: A Guide for Parents of Sensitive Children',
  },
}

type LessonDetail = {
  id: number
  kind: string
  title: string
  description: string | null
  body: string | null
  externalUrl: string | null
  fileName: string | null
  hasFile: boolean
  hasVideo: boolean
  sectionTitle: string
  sectionSlug: string
}

/**
 * A closeable in-chat reader. When a member taps a resource Remi cited, this
 * dialog loads and shows the content (article text, video, embed, PDF, or
 * external link) right on top of the conversation — so closing it returns them
 * exactly where they were, without losing the chat.
 */
export function RemiResourceReader({
  lessonId,
  fallbackTitle,
  onClose,
}: {
  lessonId: number | null
  fallbackTitle?: string
  onClose: () => void
}) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lessonId == null) {
      setLesson(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setLesson(null)
    fetch(`/api/library/lesson/${lessonId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('We could not open this resource.')
        return (await res.json()) as LessonDetail
      })
      .then((data) => {
        if (!cancelled) setLesson(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'We could not open this resource.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lessonId])

  const open = lessonId != null
  const title = lesson?.title ?? fallbackTitle ?? 'Resource'
  const cover = lesson?.fileName ? DOCUMENT_COVERS[lesson.fileName] : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[88vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-stone px-5 py-4 text-left">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
            {lesson?.sectionTitle ?? 'Library'}
          </p>
          <DialogTitle className="font-serif text-xl font-semibold text-deep-teal text-balance">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loading && (
            <div className="flex items-center justify-center py-16 text-charcoal/55">
              <Loader2 className="size-6 animate-spin" aria-hidden="true" />
              <span className="sr-only">Loading resource</span>
            </div>
          )}

          {error && !loading && (
            <p className="rounded-lg border border-dashed border-stone bg-off-white px-4 py-8 text-center font-serif text-[15px] text-charcoal/70">
              {error}
            </p>
          )}

          {lesson && !loading && (
            <div className="flex flex-col gap-4">
              {/* Video (uploaded) */}
              {lesson.kind === 'video' && lesson.hasVideo && (
                <div className="overflow-hidden rounded-xl border border-stone bg-charcoal">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    src={`/api/library/file/${lesson.id}`}
                    controls
                    controlsList="nodownload"
                    className="aspect-video w-full bg-charcoal"
                  />
                </div>
              )}

              {/* Embedded video (YouTube/Vimeo) */}
              {lesson.kind === 'embed' && toEmbedUrl(lesson.externalUrl ?? '') && (
                <div className="overflow-hidden rounded-xl border border-stone bg-charcoal">
                  <iframe
                    src={toEmbedUrl(lesson.externalUrl ?? '') as string}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="aspect-video w-full bg-charcoal"
                  />
                </div>
              )}

              {/* External link */}
              {lesson.kind === 'link' && lesson.externalUrl && (
                <a
                  href={lesson.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-full bg-deep-teal px-5 py-2.5 font-sans text-sm font-semibold text-off-white transition-colors hover:bg-deep-teal/90"
                >
                  Open this content
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              )}

              {/* Document / PDF */}
              {lesson.kind === 'document' && lesson.hasFile && (
                <div className="flex flex-col items-center gap-4 rounded-xl border border-stone bg-sage-light px-5 py-6">
                  {cover ? (
                    <a
                      href={`/api/library/file/${lesson.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-36 overflow-hidden rounded-lg border border-stone shadow-sm transition-transform active:scale-[0.98]"
                    >
                      <Image
                        src={cover.src || '/placeholder.svg'}
                        alt={`Cover of ${cover.label}`}
                        width={460}
                        height={655}
                        className="h-auto w-full"
                      />
                    </a>
                  ) : (
                    <span className="flex size-11 items-center justify-center rounded-full bg-deep-teal/10">
                      <FileText className="size-5 text-deep-teal" aria-hidden="true" />
                    </span>
                  )}
                  <p className="text-center font-serif text-[15px] leading-relaxed text-charcoal/75">
                    Open it in your device&apos;s reader, where you can pinch to zoom and scroll
                    comfortably &mdash; or download a copy.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={`/api/library/file/${lesson.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 font-sans text-sm font-semibold text-off-white transition-colors hover:bg-deep-teal/90"
                    >
                      Open
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                    <a
                      href={`/api/library/file/${lesson.id}?download=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-deep-teal/40 px-5 py-2.5 font-sans text-sm font-semibold text-deep-teal transition-colors hover:bg-off-white"
                    >
                      Download
                      <Download className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}

              {/* Description (shown for everything that has one) */}
              {lesson.description && (
                <p className="font-serif text-[16px] leading-relaxed text-charcoal/80">
                  {lesson.description}
                </p>
              )}

              {/* Article body */}
              {lesson.kind === 'article' && lesson.body && (
                <article className="whitespace-pre-wrap font-serif text-[16px] leading-relaxed text-charcoal/85">
                  {lesson.body}
                </article>
              )}

              {lesson.kind === 'document' && (
                <p className="flex items-start gap-2 rounded-lg border border-stone bg-off-white px-3.5 py-2.5 font-sans text-xs leading-relaxed text-charcoal/65">
                  <Lock className="mt-0.5 size-3.5 shrink-0 text-deep-teal" aria-hidden="true" />
                  <span>
                    For members only. This material is copyrighted by The Tuned In Institute and
                    provided for your personal use. Please don&apos;t share it publicly.
                  </span>
                </p>
              )}

              {/* Always offer the full library page for the richest experience. */}
              <Link
                href={`/library/${lesson.sectionSlug}?lesson=${lesson.id}`}
                className="self-start font-sans text-sm font-semibold text-deep-teal underline-offset-4 hover:underline"
              >
                Open in the full library
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
