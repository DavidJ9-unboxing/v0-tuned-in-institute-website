'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renders Remi's reply as formatted markdown so **bold**, *italics*, lists, and
 * links display properly instead of showing raw asterisks. Element styling is
 * kept in step with the surrounding chat bubble (sans, 15px, relaxed leading,
 * muted charcoal) so formatted text sits naturally in the conversation.
 *
 * Only used for Remi's (assistant) replies — the member's own messages stay as
 * plain, pre-wrapped text so nothing they typed is reinterpreted as markdown.
 */
export function RemiMarkdown({ children }: { children: string }) {
  return (
    <div className="font-sans text-[15px] leading-relaxed text-charcoal/85 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-2 break-words">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-charcoal">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1 pl-5 marker:text-charcoal/40">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-charcoal/40">{children}</ol>
          ),
          li: ({ children }) => <li className="break-words pl-1">{children}</li>,
          h1: ({ children }) => (
            <h1 className="mb-1.5 mt-3 text-[17px] font-semibold text-charcoal">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-1.5 mt-3 text-[16px] font-semibold text-charcoal">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1 mt-3 text-[15px] font-semibold text-charcoal">{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-stone pl-3 text-charcoal/70">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-deep-teal underline underline-offset-2 hover:text-teal-mid"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-paper px-1 py-0.5 font-mono text-[13px] text-charcoal">
              {children}
            </code>
          ),
          hr: () => <hr className="my-3 border-stone" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
