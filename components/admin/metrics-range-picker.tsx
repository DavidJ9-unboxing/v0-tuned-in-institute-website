'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RANGE_OPTIONS, type RangeKey } from '@/lib/admin-metrics'

/**
 * Period selector for the metrics page. Presets update the URL immediately;
 * the custom range reveals two date inputs and applies on submit. State lives
 * in the URL (?range=, ?from=, ?to=) so the server component can read it.
 */
export function MetricsRangePicker({
  range,
  from,
  to,
}: {
  range: RangeKey
  from: string
  to: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customFrom, setCustomFrom] = useState(from)
  const [customTo, setCustomTo] = useState(to)

  function pushParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value === null) params.delete(key)
      else params.set(key, value)
    }
    router.push(`/admin/metrics?${params.toString()}`)
  }

  function onPresetChange(value: string) {
    if (value === 'custom') {
      pushParams({ range: 'custom', from: customFrom, to: customTo })
    } else {
      pushParams({ range: value, from: null, to: null })
    }
  }

  function applyCustom() {
    if (!customFrom || !customTo) return
    pushParams({ range: 'custom', from: customFrom, to: customTo })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label className="font-sans text-xs font-medium text-muted-foreground">Time period</Label>
        <Select value={range} onValueChange={onPresetChange}>
          <SelectTrigger className="w-[180px] font-sans">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="font-sans">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {range === 'custom' && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="metrics-from" className="font-sans text-xs font-medium text-muted-foreground">
              From
            </Label>
            <Input
              id="metrics-from"
              type="date"
              value={customFrom}
              max={customTo || undefined}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-[160px] font-sans"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="metrics-to" className="font-sans text-xs font-medium text-muted-foreground">
              To
            </Label>
            <Input
              id="metrics-to"
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-[160px] font-sans"
            />
          </div>
          <Button
            type="button"
            onClick={applyCustom}
            disabled={!customFrom || !customTo}
            className="font-sans font-semibold"
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  )
}
