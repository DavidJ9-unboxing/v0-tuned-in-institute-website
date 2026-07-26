'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { Credentials } from '@/app/admin/actions'

/**
 * Shows a newly created / reset client's sign-in credentials with copy buttons.
 * This is the primary hand-off path: staff can read these to the client in the
 * session or paste them into paperwork, so access no longer depends on the
 * client catching a one-time email.
 */
export function CredentialsCallout({
  credentials,
  signInUrl = '/sign-in',
}: {
  credentials: Credentials
  signInUrl?: string
}) {
  return (
    <div className="rounded-xl border border-deep-teal/30 bg-sage-light p-4">
      <p className="font-sans text-sm font-semibold text-deep-teal">
        Share these sign-in details with your client
      </p>
      <p className="mt-1 font-sans text-xs leading-relaxed text-charcoal/70">
        Read them aloud in session or add them to their paperwork. They&apos;ll choose their own
        password the first time they sign in. A copy was also emailed as a backup.
      </p>
      <dl className="mt-3 flex flex-col gap-2">
        <CopyRow label="Sign-in page" value={absoluteUrl(signInUrl)} />
        <CopyRow label="Email" value={credentials.email} />
        <CopyRow label="Temporary password" value={credentials.password} mono />
      </dl>
    </div>
  )
}

function absoluteUrl(path: string) {
  if (typeof window === 'undefined') return path
  if (path.startsWith('http')) return path
  return `${window.location.origin}${path}`
}

function CopyRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable; the value is still visible to copy manually.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-deep-teal/15 bg-card px-3 py-2">
      <div className="min-w-0">
        <dt className="font-sans text-[11px] uppercase tracking-wide text-charcoal/50">{label}</dt>
        <dd
          className={`truncate text-sm text-charcoal ${mono ? 'font-mono font-semibold' : 'font-sans'}`}
        >
          {value}
        </dd>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-deep-teal/30 px-2.5 py-1.5 font-sans text-xs font-semibold text-deep-teal transition-colors hover:bg-deep-teal hover:text-off-white"
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        {copied ? (
          <>
            <Check className="size-3.5" aria-hidden="true" /> Copied
          </>
        ) : (
          <>
            <Copy className="size-3.5" aria-hidden="true" /> Copy
          </>
        )}
      </button>
    </div>
  )
}
