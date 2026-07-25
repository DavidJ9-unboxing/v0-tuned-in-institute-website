import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { RemiChat } from '@/components/library/remi-chat'

export const metadata: Metadata = {
  title: 'Chat with Remi',
  description:
    'Have a full conversation with Remi, your Tuned In AI concierge, and keep every resource she shares in one place.',
}

export default async function ConciergeChatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  // Gate to signed-in members, matching the /library segment behavior.
  const user = await requireUser()
  if (user.mustChangePassword) redirect('/account/password?first=1')

  const { q } = await searchParams
  const initialQuery = typeof q === 'string' ? q : ''

  return (
    <div className="min-h-[80vh] bg-off-white">
      <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col px-5 py-6 sm:px-8 sm:py-10">
        <div className="mb-4">
          <Link
            href="/concierge"
            className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-deep-teal hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Remi
          </Link>
        </div>
        <header className="mb-5">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">
            Your AI concierge
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-deep-teal sm:text-4xl text-balance">
            Chat with Remi
          </h1>
          <p className="mt-2 max-w-2xl font-serif text-[16px] leading-relaxed text-charcoal/75">
            Ask anything about your child, your teen, or yourself. Your whole conversation stays
            here, and every resource Remi shares is collected for you on the side.
          </p>
        </header>
        <div className="min-h-0 flex-1">
          <RemiChat variant="page" initialQuery={initialQuery} />
        </div>
      </div>
    </div>
  )
}
