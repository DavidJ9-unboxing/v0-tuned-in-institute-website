'use client'

import { useActionState, useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { submitGroupInterest, type GroupInterestState } from '@/app/actions/group-interest'
import { GROUP_TYPES, type GroupType } from '@/lib/groups'
import { Button } from '@/components/ui/button'

const initialState: GroupInterestState = { status: 'idle', message: '' }

const inputClass =
  'w-full rounded-lg border border-stone bg-card px-4 py-2.5 font-sans text-[15px] text-charcoal placeholder:text-charcoal/40 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20'

const labelClass = 'font-sans text-sm font-semibold text-charcoal'

export function GroupInterestForm() {
  const [state, formAction, pending] = useActionState(submitGroupInterest, initialState)
  const [groupType, setGroupType] = useState<GroupType>('parent-child')
  const isAdult = groupType === 'adult'

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-xl border border-sage-deep/40 bg-sage-light px-6 py-10 text-center"
      >
        <CheckCircle2 className="size-8 text-sage-deep" aria-hidden="true" />
        <p className="font-serif text-xl font-semibold text-deep-teal">You&apos;re on the list</p>
        <p className="max-w-md font-serif text-[15px] leading-relaxed text-charcoal/80">
          {state.message}
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className={`${labelClass} mb-2`}>Which group are you interested in?</legend>
        {(Object.keys(GROUP_TYPES) as GroupType[]).map((key) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone bg-card px-4 py-3 font-sans text-[15px] text-charcoal has-[:checked]:border-deep-teal has-[:checked]:bg-teal-light/40"
          >
            <input
              type="radio"
              name="groupType"
              value={key}
              checked={groupType === key}
              onChange={() => setGroupType(key)}
              className="size-4 accent-deep-teal"
            />
            {GROUP_TYPES[key]}
          </label>
        ))}
      </fieldset>

      {!isAdult && (
        <div className="flex flex-col gap-2">
          <label htmlFor="childAge" className={labelClass}>
            Age of your {groupType === 'parent-teen' ? 'teen' : 'child'}
          </label>
          <input
            id="childAge"
            name="childAge"
            required
            maxLength={100}
            className={inputClass}
            placeholder={groupType === 'parent-teen' ? 'e.g. 15' : 'e.g. 7'}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="goals" className={labelClass}>
          Your interest and goals
        </label>
        <textarea
          id="goals"
          name="goals"
          required
          rows={4}
          maxLength={2000}
          className={inputClass}
          placeholder={
            isAdult
              ? 'What would you like from a self-care and connection group?'
              : 'What would you like support with while your child or teen is in therapy?'
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="availability" className={labelClass}>
          Days and times that usually work <span className="text-charcoal/50">(optional)</span>
        </label>
        <input
          id="availability"
          name="availability"
          maxLength={300}
          className={inputClass}
          placeholder="e.g. weekday evenings, Saturday mornings"
        />
      </div>

      {state.status === 'error' && (
        <p role="alert" className="flex items-start gap-2 font-sans text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="font-sans font-semibold">
        {pending ? 'Sending…' : 'Sign up for a group'}
      </Button>
    </form>
  )
}
