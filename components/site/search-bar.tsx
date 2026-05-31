'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRemi } from '@/components/library/remi-launcher'

export function SearchBar({
  placeholder = 'Ask anything about sensitivity, your child, or yourself…',
}: {
  placeholder?: string
}) {
  const { open } = useRemi()
  const [value, setValue] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Open Remi in the slide-over panel, pre-filling the typed question.
    open(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Sparkles className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-teal-mid" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            aria-label="Ask Remi, the Tuned In Institute AI concierge"
            className="h-14 w-full rounded-xl border border-stone bg-card pl-12 pr-4 font-sans text-[15px] text-charcoal placeholder:text-charcoal/45 focus:border-deep-teal focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
          />
        </div>
        <Button type="submit" size="lg" className="h-14 gap-2 px-7 font-sans font-semibold">
          <Sparkles className="size-4" aria-hidden="true" />
          Ask Remi
        </Button>
      </div>
    </form>
  )
}
