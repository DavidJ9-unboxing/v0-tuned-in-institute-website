'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Article-scale markdown renderer for library resources (handouts, guides).
 *
 * This is the larger, reading-optimized counterpart to <RemiMarkdown>, which is
 * tuned for the smaller chat bubble. Bodies are authored in markdown so headings,
 * bold, lists, and links render as a polished, branded Tuned In page instead of
 * a flat wall of pre-wrapped text. Plain-prose bodies (older articles with no
 * markdown syntax) still render correctly — paragraphs stay paragraphs.
 */
export function ArticleMarkdown({ children }: { children: string }) {
  return (
    <article className="font-serif text-[16px] leading-relaxed text-charcoal/85 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mb-3 mt-8 font-serif text-2xl font-semibold text-deep-teal text-balance">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-8 font-serif text-xl font-semibold text-deep-teal text-balance">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 font-serif text-lg font-semibold text-charcoal">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-3 break-words">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-charcoal">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="my-3 flex list-disc flex-col gap-1.5 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 flex list-decimal flex-col gap-1.5 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-deep-teal/40 pl-4 italic text-charcoal/75">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-deep-teal underline underline-offset-2 hover:text-deep-teal/80"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-stone">
              <table className="w-full border-collapse text-left text-[15px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-sage-light">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-stone px-4 py-2.5 font-sans text-sm font-semibold text-deep-teal">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-stone/60 px-4 py-2.5 align-top text-charcoal/85">
              {children}
            </td>
          ),
          hr: () => <hr className="my-6 border-stone" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </article>
  )
}
