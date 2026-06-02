'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const chartConfig = {
  signups: {
    label: 'New accounts',
    color: 'var(--color-deep-teal)',
  },
} satisfies ChartConfig

export function SignupsChart({
  data,
}: {
  data: { day: string; label: string; signups: number }[]
}) {
  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
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
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={32}
          fontSize={12}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="signups" fill="var(--color-signups)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
