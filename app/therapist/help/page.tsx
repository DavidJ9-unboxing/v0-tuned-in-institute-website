import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, UserPlus, KeyRound, LifeBuoy, CircleCheck, TriangleAlert } from 'lucide-react'
import { requireStaff } from '@/lib/session'
import { PrintButton } from '@/components/therapist/print-button'

export const metadata = {
  title: 'Client access help | Rooted Rhythm',
}

export default async function TherapistHelpPage() {
  const staff = await requireStaff()
  if (staff.mustChangePassword) redirect('/account/password?first=1')

  return (
    <div className="flex flex-col gap-6">
      {/* Top actions — hidden on print */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          href="/therapist"
          className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-deep-teal hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to client onboarding
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-stone bg-card p-6 sm:p-10 print:border-0 print:p-0">
        <header className="border-b border-stone pb-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-sage-deep">
            Clinician quick guide
          </p>
          <h1 className="mt-2 text-balance font-serif text-3xl font-semibold text-deep-teal">
            When a client can&apos;t get into Tuned In Institute
          </h1>
          <p className="mt-3 font-sans leading-relaxed text-muted-foreground">
            Use this sheet in session to get a client access right away. First figure out which of
            the three situations below you&apos;re in, then follow those steps.
          </p>
        </header>

        {/* Situation 1 */}
        <section className="border-b border-stone py-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-light text-deep-teal">
              <UserPlus className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-charcoal">
                  1. The client was never added, or isn&apos;t sure they have an account
                </h2>
                <p className="mt-1 font-sans text-sm leading-relaxed text-muted-foreground">
                  Create the account yourself and hand them the login on the spot.
                </p>
              </div>
              <ol className="flex flex-col gap-2 font-sans text-sm leading-relaxed text-charcoal">
                <li>
                  <span className="font-semibold">1.</span> Sign in at rootedrhythm.com with your{' '}
                  <span className="font-semibold">@rootedrhythm.com</span> email.
                </li>
                <li>
                  <span className="font-semibold">2.</span> Open the{' '}
                  <span className="font-semibold">Add clients</span> page (in your account menu, top
                  right — you&apos;ll usually land here on sign-in).
                </li>
                <li>
                  <span className="font-semibold">3.</span> Enter the client&apos;s{' '}
                  <span className="font-semibold">name and email</span>, then click{' '}
                  <span className="font-semibold">Add client</span>.
                </li>
                <li>
                  <span className="font-semibold">4.</span> A{' '}
                  <span className="font-semibold">temporary password</span> appears with a{' '}
                  <span className="font-semibold">Copy</span> button. Read it to the client or write
                  it on their paperwork. It&apos;s also emailed to them as a backup.
                </li>
                <li>
                  <span className="font-semibold">5.</span> Tell them:{' '}
                  <span className="italic text-charcoal/80">
                    &ldquo;Go to rootedrhythm.com, click Sign in, use your email and this temporary
                    password. You&apos;ll be asked to choose your own password right away.&rdquo;
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Situation 2 */}
        <section className="border-b border-stone py-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-light text-deep-teal">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-charcoal">
                  2. They have an account but never got (or lost) the invite email
                </h2>
                <p className="mt-1 font-sans text-sm leading-relaxed text-muted-foreground">
                  No need to re-send email — just give them a fresh password directly.
                </p>
              </div>
              <ol className="flex flex-col gap-2 font-sans text-sm leading-relaxed text-charcoal">
                <li>
                  <span className="font-semibold">1.</span> On the{' '}
                  <span className="font-semibold">Add clients</span> page, find the client in your
                  list.
                </li>
                <li>
                  <span className="font-semibold">2.</span> Click{' '}
                  <span className="font-semibold">Reset password</span>.
                </li>
                <li>
                  <span className="font-semibold">3.</span> A fresh{' '}
                  <span className="font-semibold">temporary password</span> appears with a{' '}
                  <span className="font-semibold">Copy</span> button — share it the same way as
                  above.
                </li>
                <li>
                  <span className="font-semibold">4.</span> Their old password stops working; the
                  new one gets them in, then prompts them to set their own.
                </li>
              </ol>
              <p className="rounded-lg bg-secondary/60 px-4 py-3 font-sans text-sm leading-relaxed text-deep-teal">
                Note: you can only reset passwords for clients{' '}
                <span className="font-semibold">you</span> added. If someone else set them up, ask
                an admin or the clinician who added them.
              </p>
            </div>
          </div>
        </section>

        {/* Situation 3 */}
        <section className="py-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-light text-deep-teal">
              <LifeBuoy className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-charcoal">
                  3. They forgot their password and you&apos;re not together
                </h2>
                <p className="mt-1 font-sans text-sm leading-relaxed text-muted-foreground">
                  Point them to self-service — no clinician needed.
                </p>
              </div>
              <p className="font-sans text-sm leading-relaxed text-charcoal">
                Tell them:{' '}
                <span className="italic text-charcoal/80">
                  &ldquo;On the sign-in page, click Forgot password?, enter your email, and follow
                  the link we send you.&rdquo;
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mt-2 rounded-xl border border-stone bg-background p-5 print:bg-transparent">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-charcoal">
            <TriangleAlert className="size-5 text-sage-deep" aria-hidden="true" />
            If sign-in still fails, double-check
          </h2>
          <ul className="mt-3 flex flex-col gap-2 font-sans text-sm leading-relaxed text-charcoal">
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-sage-deep" aria-hidden="true" />
              They&apos;re using the <span className="font-semibold">exact email</span> the account
              was created with — typos are the number one cause.
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-sage-deep" aria-hidden="true" />
              The temporary password is entered exactly as shown — it&apos;s case-sensitive, so the
              Copy button avoids mistakes.
            </li>
            <li className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-sage-deep" aria-hidden="true" />
              If a password was reset more than once, only the{' '}
              <span className="font-semibold">most recent</span> one works.
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}
