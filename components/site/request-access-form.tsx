'use client'

import { useActionState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { requestAccess, type RequestAccessState } from '@/app/actions/request-access'
import { Button } from '@/components/ui/button'

const initialState: RequestAccessState = { status: 'idle', message: '' }

const inputClass =
  'w-full rounded-lg border border-stone bg-card px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20'

const labelClass = 'font-sans text-sm font-semibold text-charcoal'

export function RequestAccessForm() {
  const [state, formAction, pending] = useActionState(requestAccess, initialState)

  if (state.status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-sage-deep/40 bg-sage-light px-8 py-12 text-center">
        <CheckCircle2 className="size-10 text-sage-deep" aria-hidden="true" />
        <h3 className="font-serif text-2xl font-semibold text-deep-teal">Request received</h3>
        <p className="max-w-md font-serif text-[16px] leading-relaxed text-charcoal/80">
          {state.message}
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>
          Full name
        </label>
        <input id="name" name="name" required className={inputClass} placeholder="Your name" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="relationship" className={labelClass}>
          Your relationship to Rooted Rhythm
        </label>
        <select id="relationship" name="relationship" className={inputClass} defaultValue="">
          <option value="" disabled>
            Please select
          </option>
          <option value="Current Rooted Rhythm client">Current Rooted Rhythm client</option>
          <option value="Former Rooted Rhythm client">Former Rooted Rhythm client</option>
          <option value="Not yet a client">Not yet a client</option>
          <option value="Clinician / professional">Clinician / professional</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={labelClass}>
          Anything you&apos;d like us to know <span className="text-charcoal/50">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={inputClass}
          placeholder="Tell us a little about what you're looking for."
        />
      </div>

      {state.status === 'error' && (
        <p className="flex items-start gap-2 font-sans text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="mt-2 font-sans font-semibold"
      >
        {pending ? 'Sending…' : 'Send request'}
      </Button>

      <p className="font-sans text-xs leading-relaxed text-charcoal/55">
        Your request goes directly to the Institute team. Access to the content library is reserved
        for Rooted Rhythm clients.
      </p>
    </form>
  )
}
