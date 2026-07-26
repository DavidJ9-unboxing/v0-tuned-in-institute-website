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
 */

import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Loader2 } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Resolve the worker from the installed pdfjs-dist (version-matched to react-pdf).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

// cMaps + standard fonts let PDF.js render documents that rely on non-embedded
// fonts/character maps. Served from a CDN pinned to the installed version.
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
  const [error, setError] = useState(false)

  // Render pages at the container's current width so the document is responsive
  // and re-fits when the layout changes (e.g. entering fullscreen). The scroll
  // container reserves a stable scrollbar gutter, so the measured width doesn't
  // oscillate when the vertical scrollbar appears/disappears. We also only push
  // a new value when it actually changes, to avoid a ResizeObserver feedback loop.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = Math.floor(el.clientWidth)
      setWidth((prev) => (prev === w ? prev : w))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const fileUrl = `/api/library/file/${fileId}`

  return (
    <div
      className={
        fullscreen
          ? 'h-full w-full overflow-auto bg-card p-4 [scrollbar-gutter:stable]'
          : 'max-h-[75vh] w-full overflow-auto bg-card p-4 [scrollbar-gutter:stable]'
      }
    >
      {/* Measured separately (no padding) so page width matches the content box. */}
      <div ref={containerRef} className="w-full">
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
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => setError(true)}
          loading={
            <div className="flex items-center justify-center gap-2 px-6 py-16 font-serif text-[15px] text-charcoal/60">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading document…
            </div>
          }
          className="flex flex-col items-center gap-4"
        >
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={width || undefined}
              className="overflow-hidden rounded-lg border border-stone shadow-sm"
              renderAnnotationLayer={false}
              renderTextLayer
            />
          ))}
        </Document>
      )}
      </div>
    </div>
  )
}
