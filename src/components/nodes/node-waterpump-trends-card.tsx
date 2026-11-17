import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useFireTelemetryAggregate } from "@/features/telemetry/queries"

import { NodeTrendCard } from "./node-trend-card"
import {
  formatTrendTime,
  formatTrendTooltipLabel,
  getTrendWindow,
  RANGE_INTERVAL_MINUTES,
  type TrendRange,
} from "./node-trends-data"

const chartConfig = {
  pump: {
    label: "Pompa ON (%)",
    color: "var(--chart-humidity)",
  },
} satisfies ChartConfig

export function NodeWaterPumpTrendsCard({ deviceId }: { deviceId: string }) {
  const [range, setRange] = useState<TrendRange>("1H")
  const window = useMemo(() => getTrendWindow(range), [range])
  const query = useFireTelemetryAggregate(deviceId, {
    from: window.from,
    to: window.to,
    interval: RANGE_INTERVAL_MINUTES[range],
  })

  const points = useMemo(() => {
    const rows = query.data?.points ?? []

    return rows
      .map((row) => ({
        time: Date.parse(row.bucket_start),
        pump: Math.round(row.pump_on_ratio * 100),
      }))
      .filter((point) => Number.isFinite(point.time))
  }, [query.data])

  const isEmpty = !query.isLoading && !query.isError && points.length === 0

  return (
    <NodeTrendCard
      title="Water Pump Trends"
      range={range}
      onRangeChange={setRange}
      isLoading={query.isLoading}
      isError={query.isError}
      errorMessage={query.error?.message}
      onRetry={() => void query.refetch()}
      isEmpty={isEmpty}
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
        <AreaChart data={points} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickFormatter={(value: number) => formatTrendTime(value, range)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            domain={[0, 100]}
            tickFormatter={(value: number) => `${value}%`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) =>
                  formatTrendTooltipLabel(payload, range)
                }
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            dataKey="pump"
            type="monotone"
            stroke="var(--color-pump)"
            fill="var(--color-pump)"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </NodeTrendCard>
  )
}
