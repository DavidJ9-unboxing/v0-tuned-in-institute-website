'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

export interface TimeseriesPoint {
  label: string
  value: number
}

/**
 * Reusable admin time-series chart. Renders an area chart (good for sessions /
 * cumulative-feeling trends) or a bar chart (good for discrete daily counts
 * like new accounts). The series is pre-bucketed and gap-filled on the server.
 */
export function TimeseriesChart({
  data,
  seriesLabel,
  color = 'var(--color-deep-teal)',
  variant = 'area',
}: {
  data: TimeseriesPoint[]
  seriesLabel: string
  color?: string
  variant?: 'area' | 'bar'
}) {
  const chartConfig = {
    value: { label: seriesLabel, color },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      {variant === 'bar' ? (
        <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            fontSize={12}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} fontSize={12} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : (
        <AreaChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="fill-value" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            fontSize={12}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} fontSize={12} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={2}
            fill="url(#fill-value)"
          />
        </AreaChart>
      )}
    </ChartContainer>
  )
}
