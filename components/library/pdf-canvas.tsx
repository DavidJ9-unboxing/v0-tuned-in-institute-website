'use client'

/**
 * Canvas-based PDF reader (PDF.js via react-pdf).
 *
 * We deliberately do NOT use a native `<iframe src="…pdf">` for documents.
 * The browser's built-in PDF plugin refuses to render inside a sandboxed or
 * deeply-nested iframe (it shows a broken-file icon), and mobile browsers don't
 * support inline PDF-in-iframe at all — they force a download. Rendering each
 * page to a `<canvas>` with PDF.js works everywhere: desktop, mobile, and
 * inside sandboxed iframes, so members can always read documents in place.
 *
 * One page is rendered at a time with prev/next controls. This keeps memory and
 * layout cost low for long documents (some are full books) and avoids the
 * layout thrash of mounting dozens of canvas+text layers at once.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Resolve the worker from the installed pdfjs-dist (version-matched to react-pdf).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

// cMaps + standard fonts let PDF.js render documents that rely on non-embedded
// fonts/character maps. Served from a CDN pinned to the installed version.
// Hoisted to module scope so the object identity is stable across renders —
// passing a fresh object to <Document> on every render causes an infinite
// reload/re-render loop.
const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
}

export function PdfCanvas({
  fileId,
  title,
  fullscreen = false,
}: {
  fileId: number
  title: string
  /** When rendered inside the fullscreen wrapper, fill available height and scroll. */
  fullscreen?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>(0)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [error, setError] = useState(false)

  // Render the page at the container's current width so the document is
  // responsive and re-fits when the layout changes (e.g. entering fullscreen).
  // Only push a new value when it actually changes, to avoid a ResizeObserver
  // feedback loop with the scrollbar.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Measure once on mount using rAF (after layout settles). We intentionally
    // do NOT observe resize continuously: react-pdf re-rendering a page changes
    // the scroll height, which the observer would read back as a width change,
    // creating a setState feedback loop. Fullscreen enter/exit remounts this
    // component (via the `key`), so a one-time measure is sufficient.
    let raf = requestAnimationFrame(() => {
      const w = Math.floor(el.clientWidth)
      if (w > 0) setWidth((prev) => (prev === w ? prev : w))
    })
    return () => cancelAnimationFrame(raf)
    // Re-measure when toggling fullscreen (the container size changes).
  }, [fullscreen])

  const fileUrl = `/api/library/file/${fileId}`

  const goPrev = useCallback(() => setPageNumber((p) => Math.max(1, p - 1)), [])
  const goNext = useCallback(
    () => setPageNumber((p) => Math.min(numPages || p, p + 1)),
    [numPages],
  )

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }, [])

  return (
    <div
      className={
        fullscreen
          ? 'flex h-full w-full flex-col bg-card'
          : 'flex w-full flex-col bg-card'
      }
    >
      {/* Scrollable page area */}
      <div
        ref={containerRef}
        className={
          fullscreen
            ? 'flex-1 overflow-auto p-4 [scrollbar-gutter:stable]'
            : 'max-h-[70vh] overflow-auto p-4 [scrollbar-gutter:stable]'
        }
      >
        {error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="font-serif text-[15px] text-charcoal/70">
              This document couldn&apos;t be displayed here.
            </p>
            <a
              href={`${fileUrl}?download=1`}
              className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 font-sans text-sm font-semibold text-off-white transition-colors hover:bg-deep-teal/90"
            >
              Download the document
            </a>
          </div>
        ) : (
          <Document
            file={fileUrl}
            options={PDF_OPTIONS}
            onLoadSuccess={onLoadSuccess}
            onLoadError={() => setError(true)}
            loading={
              <div className="flex items-center justify-center gap-2 px-6 py-16 font-serif text-[15px] text-charcoal/60">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading document…
              </div>
            }
            className="flex flex-col items-center"
          >
            <Page
              pageNumber={pageNumber}
              width={width || undefined}
              className="overflow-hidden rounded-lg border border-stone shadow-sm"
              renderAnnotationLayer={false}
              renderTextLayer
              loading={
                <div className="flex items-center justify-center gap-2 px-6 py-16 font-serif text-[15px] text-charcoal/60">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Loading page…
                </div>
              }
            />
          </Document>
        )}
      </div>

      {/* Pager */}
      {!error && numPages > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-stone px-4 py-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={pageNumber <= 1}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone bg-card px-4 py-2 font-sans text-sm font-medium text-deep-teal transition-colors hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Prev
          </button>
          <span className="font-sans text-sm tabular-nums text-charcoal/70">
            Page {pageNumber} of {numPages}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={pageNumber >= numPages}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone bg-card px-4 py-2 font-sans text-sm font-medium text-deep-teal transition-colors hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
