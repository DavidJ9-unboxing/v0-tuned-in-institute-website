'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Download, ExternalLink, FileText, Lock, Maximize, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/lib/content'

// Some PDF documents are full books/guides and have a real cover image we can
// show (clickable) instead of a generic file icon. Keyed by the stored file
// name. Documents not listed here (e.g. slide decks) fall back to the icon.
const DOCUMENT_COVERS: Record<string, { src: string; label: string }> = {
  'Tuned In - A Guide for Parents of Sensitive Children.pdf': {
    src: '/images/tuned-in-book-cover.png',
    label: 'Tuned In: A Guide for Parents of Sensitive Children',
  },
}

function getDocumentCover(fileName?: string | null) {
  if (!fileName) return null
  return DOCUMENT_COVERS[fileName] ?? null
}
import { toEmbedUrl } from '@/lib/video'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Session-scoped flag: once a member acknowledges the sharing terms, we don't
// re-prompt on every download for the rest of their visit.
const DOWNLOAD_ACK_KEY = 'tii-download-ack-v1'

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
  const viewerRef = useRef<HTMLDivElement>(null)

  // Display numbers. Most lessons get a plain incrementing number (1, 2, 3…).
  // A lesson flagged `isSubItem` instead shares the previous main item's number
  // with a letter suffix (the main item is implicitly "a", so the first sub is
  // "b") — e.g. an extended guide listed as "1b" beneath item "1".
  const lessonLabels = (() => {
    const labels: string[] = []
    let mainNum = 0
    let subLetter = 0
    for (const l of lessons) {
      if (l.isSubItem && mainNum > 0) {
        subLetter += 1
        labels.push(`${mainNum}${String.fromCharCode(97 + subLetter)}`)
      } else {
        mainNum += 1
        subLetter = 0
        labels.push(`${mainNum}`)
      }
    }
    return labels
  })()

  // The viewer sits above the lesson list (and on mobile the list is stacked
  // below it), so selecting a lesson would otherwise update content that's off
  // the top of the screen. Bring the viewer back into view on every selection.
  function selectLesson(id: number) {
    setActiveId(id)
    viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Fullscreen support for documents. Landscape PDFs are hard to read in the
  // portrait viewer, so the fullscreen button fills the screen and (on phones)
  // locks to landscape — letting the reader rotate for a wide horizontal view.
  const docWrapRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // One-time sharing/copyright acknowledgment before the first download of a visit.
  const [ackOpen, setAckOpen] = useState(false)
  const pendingDownloadRef = useRef<string | null>(null)

  // Returns true if the member already acknowledged this session.
  function hasAcknowledged() {
    try {
      return sessionStorage.getItem(DOWNLOAD_ACK_KEY) === '1'
    } catch {
      return false
    }
  }

  // Open the document in a new tab (matches the previous <a target="_blank"> behaviour).
  function openDownload(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Intercept a download: prompt with the terms first time, then proceed.
  function handleDownloadClick(e: React.MouseEvent<HTMLAnchorElement>, url: string) {
    if (hasAcknowledged()) return // let the anchor navigate normally
    e.preventDefault()
    pendingDownloadRef.current = url
    setAckOpen(true)
  }

  function confirmDownload() {
    try {
      sessionStorage.setItem(DOWNLOAD_ACK_KEY, '1')
    } catch {
      /* storage unavailable — proceed anyway */
    }
    const url = pendingDownloadRef.current
    setAckOpen(false)
    if (url) openDownload(url)
    pendingDownloadRef.current = null
  }

  useEffect(() => {
    function onChange() {
      const fs = Boolean(document.fullscreenElement)
      setIsFullscreen(fs)
      // Release the orientation lock when leaving fullscreen.
      if (!fs) {
        try {
          ;(screen.orientation as ScreenOrientation & { unlock?: () => void })?.unlock?.()
        } catch {
          /* unsupported — ignore */
        }
      }
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  async function openFullscreen() {
    const el = docWrapRef.current
    if (!el) return
    try {
      if (el.requestFullscreen) await el.requestFullscreen()
      // Lock to landscape on devices that support it (mostly phones/tablets).
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (o: string) => Promise<void>
      }
      if (orientation?.lock) {
        try {
          await orientation.lock('landscape')
        } catch {
          /* desktop / unsupported — stays in current orientation */
        }
      }
    } catch {
      /* fullscreen blocked — nothing we can do */
    }
  }

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
      <div ref={viewerRef} className="order-1 flex flex-col gap-5 scroll-mt-24">
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
                  This library content will open in a new browser tab.
                </p>
                <a
                  href={active.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 font-sans text-sm font-semibold text-off-white transition-colors hover:bg-deep-teal/90"
                >
                  Open this content
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </div>
            )}

            {active.kind === 'document' && active.fileUrl && (
              <div className="flex flex-col gap-4">
                {isPdf(active.fileUrl, active.fileName) && (
                  <>
                    {/* Tablet / desktop: inline PDF preview. Hidden on phones,
                        where embedded PDFs render oversized and can't be
                        pinch-zoomed — those get the preview card below instead. */}
                    <div
                      ref={docWrapRef}
                      className={cn(
                        'overflow-hidden border border-stone bg-card',
                        isFullscreen
                          ? 'flex h-screen w-screen flex-col rounded-none'
                          : 'hidden rounded-2xl md:block',
                      )}
                    >
                      {/* view=Fit shows the whole page within the frame, so wide
                          landscape pages fit fully (just smaller) instead of
                          overflowing. The viewer scrolls internally between pages. */}
                      <iframe
                        key={active.id}
                        src={`/api/library/file/${active.id}#toolbar=1&navpanes=0&view=Fit`}
                        title={active.title}
                        className={cn('w-full', isFullscreen ? 'flex-1' : 'h-[75vh]')}
                      />
                    </div>

                    {/* Phones: a compact card that opens the document in the
                        device's native reader (proper pinch-to-zoom + scroll)
                        rather than an oversized inline iframe. When the document
                        has a cover image (e.g. a book), show it as the tappable
                        preview so it's clear what you're opening. */}
                    {(() => {
                      const cover = getDocumentCover(active.fileName)
                      return (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone bg-sage-light px-5 py-6 md:hidden">
                          {cover ? (
                            <a
                              href={`/api/library/file/${active.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-40 overflow-hidden rounded-lg border border-stone shadow-sm transition-transform active:scale-[0.98]"
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
                            {cover
                              ? 'Tap the cover to read it in your phone\u2019s reader, where you can pinch to zoom and scroll comfortably \u2014 or download a copy below.'
                              : 'This document opens in your phone\u2019s reader, where you can pinch to zoom and scroll comfortably.'}
                          </p>
                          <a
                            href={`/api/library/file/${active.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 font-sans text-sm font-semibold text-off-white transition-colors hover:bg-deep-teal/90"
                          >
                            {cover ? 'Read in reader' : 'Open document'}
                            <ExternalLink className="size-4" aria-hidden="true" />
                          </a>
                        </div>
                      )
                    })()}
                  </>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  {isPdf(active.fileUrl, active.fileName) && (
                    <button
                      type="button"
                      onClick={openFullscreen}
                      className="hidden items-center gap-2 rounded-full border border-deep-teal/40 px-5 py-2.5 font-sans text-sm font-semibold text-deep-teal transition-colors hover:bg-sage-light md:inline-flex"
                    >
                      View fullscreen
                      <Maximize className="size-4" aria-hidden="true" />
                    </button>
                  )}
                  <a
                    href={`/api/library/file/${active.id}?download=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) =>
                      handleDownloadClick(e, `/api/library/file/${active.id}?download=1`)
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 font-sans text-sm font-semibold text-off-white transition-colors hover:bg-deep-teal/90"
                  >
                    {getDocumentCover(active.fileName)
                      ? 'Download a PDF of the book'
                      : isPdf(active.fileUrl, active.fileName)
                        ? 'Download'
                        : 'Open document'}
                    <Download className="size-4" aria-hidden="true" />
                  </a>
                </div>

                <p className="flex items-start gap-2 rounded-lg border border-stone bg-off-white px-3.5 py-2.5 font-sans text-xs leading-relaxed text-charcoal/65">
                  <Lock className="mt-0.5 size-3.5 shrink-0 text-deep-teal" aria-hidden="true" />
                  <span>
                    For members only. This material is copyrighted by The Tuned In Institute and
                    provided for your personal use. Please don&apos;t share it publicly. You&apos;re
                    welcome to share it with family members who would benefit, but please ask them
                    to keep it within the family and not redistribute it.
                  </span>
                </p>
                {isPdf(active.fileUrl, active.fileName) && (
                  <p className="font-sans text-xs leading-relaxed text-charcoal/55">
                    Tip: on a phone, tap &ldquo;Open document&rdquo; to read it in your device&apos;s
                    reader with pinch-to-zoom. On a laptop or desktop you can tap &ldquo;View
                    fullscreen&rdquo; for a larger view — many documents are easiest to read there.
                  </p>
                )}
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
            const label = lessonLabels[i]
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => selectLesson(l.id)}
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
                      {label}. {l.title}
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

      <Dialog open={ackOpen} onOpenChange={setAckOpen}>
        <DialogContent className="max-w-md gap-0 p-0">
          <div className="flex flex-col gap-5 px-7 py-7">
            <DialogHeader className="gap-2">
              <span className="flex size-11 items-center justify-center rounded-full bg-deep-teal/10">
                <Lock className="size-5 text-deep-teal" aria-hidden="true" />
              </span>
              <DialogTitle className="font-serif text-xl font-semibold text-deep-teal text-balance">
                Before you download
              </DialogTitle>
              <DialogDescription className="font-serif text-[15px] leading-relaxed text-charcoal/75">
                This material is for members only and is copyrighted by The Tuned In Institute.
                Please keep it for your personal use and don&apos;t share it publicly or online.
                You&apos;re welcome to share it with family members who would benefit from reading
                it &mdash; we just ask that they keep it within the family and not pass it on
                further.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2.5">
              <Button
                type="button"
                size="lg"
                onClick={confirmDownload}
                className="font-sans font-semibold"
              >
                I understand &mdash; download
              </Button>
              <Button
                type="button"
                size="lg"
                variant="ghost"
                onClick={() => setAckOpen(false)}
                className="font-sans font-semibold text-charcoal/70 hover:text-charcoal"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
