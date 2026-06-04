'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, ExternalLink, FileText, Lock, Maximize, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/lib/content'
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

  // On phones, automatically expand a PDF to fullscreen when the device is
  // physically rotated to landscape, and collapse back to the windowed viewer
  // when rotated back to portrait. We don't lock orientation here since the
  // reader is driving it by turning the phone.
  const activeIsPdf =
    active?.kind === 'document' && !!active.fileUrl && isPdf(active.fileUrl, active.fileName)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const landscapeMql = window.matchMedia('(orientation: landscape)')
    const phoneMql = window.matchMedia('(max-width: 768px)')

    async function handleOrientation() {
      if (!phoneMql.matches) return // desktops/tablets keep the windowed viewer
      const el = docWrapRef.current
      if (landscapeMql.matches && activeIsPdf && el && !document.fullscreenElement) {
        try {
          await el.requestFullscreen?.()
        } catch {
          /* gesture/permission blocked — reader can use the button instead */
        }
      } else if (!landscapeMql.matches && document.fullscreenElement) {
        try {
          await document.exitFullscreen()
        } catch {
          /* ignore */
        }
      }
    }

    landscapeMql.addEventListener('change', handleOrientation)
    return () => landscapeMql.removeEventListener('change', handleOrientation)
  }, [activeIsPdf])

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
                  <div
                    ref={docWrapRef}
                    className={cn(
                      'overflow-hidden border border-stone bg-card',
                      isFullscreen ? 'flex h-screen w-screen flex-col rounded-none' : 'rounded-2xl',
                    )}
                  >
                    {/* view=Fit shows the whole page within the frame, so wide
                        landscape pages fit fully (just smaller) instead of
                        overflowing. The viewer scrolls internally between pages. */}
                    <iframe
                      key={active.id}
                      src={`/api/library/file/${active.id}#toolbar=1&navpanes=0&view=Fit`}
                      title={active.title}
                      className={cn('w-full', isFullscreen ? 'flex-1' : 'h-[60vh] md:h-[75vh]')}
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  {isPdf(active.fileUrl, active.fileName) && (
                    <button
                      type="button"
                      onClick={openFullscreen}
                      className="inline-flex items-center gap-2 rounded-full border border-deep-teal/40 px-5 py-2.5 font-sans text-sm font-semibold text-deep-teal transition-colors hover:bg-sage-light"
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
                    {isPdf(active.fileUrl, active.fileName) ? 'Download' : 'Open document'}
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
                    Tip: turn your phone sideways and the document will expand to fullscreen;
                    turn it back upright to return to the window. You can also tap &ldquo;View
                    fullscreen&rdquo; anytime. Many documents are easier to read on a laptop or
                    desktop.
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
