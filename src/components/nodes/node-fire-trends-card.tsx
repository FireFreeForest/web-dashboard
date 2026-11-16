import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useFireTelemetry } from "@/features/telemetry/queries"
import { adcToPercent } from "@/features/telemetry/utils"

import { NodeTrendCard } from "./node-trend-card"
import {
  createDummyFireTrend,
  formatTrendTime,
  formatTrendTooltipLabel,
  getRangeStart,
  type TrendRange,
} from "./node-trends-data"

const chartConfig = {
  flame: {
    label: "Intensitas Api (%)",
    color: "var(--chart-flame)",
  },
  smoke: {
    label: "Intensitas Asap (%)",
    color: "var(--chart-smoke)",
  },
} satisfies ChartConfig

export function NodeFireTrendsCard({ deviceId }: { deviceId: string }) {
  const [range, setRange] = useState<TrendRange>("24H")
  const from = useMemo(() => getRangeStart(range).toISOString(), [range])
  const query = useFireTelemetry(deviceId, {
    from,
    per_page: 100,
  })

  const points = useMemo(() => {
    const rows = query.data?.data ?? []

    return rows
      .slice()
      .reverse()
      .map((row) => ({
        time: new Date(row.recorded_at).getTime(),
        flame:
          row.flame_level != null ? adcToPercent(row.flame_level) : null,
        smoke: adcToPercent(row.smoke_level),
      }))
      .filter((point) => Number.isFinite(point.time))
  }, [query.data])

  const demoPoints = useMemo(() => createDummyFireTrend(range), [range])
  const isDummy = !query.isLoading && !query.isError && points.length === 0
  const chartData = isDummy ? demoPoints : points

  return (
    <NodeTrendCard
      title="Fire Detection Trends"
      description={isDummy ? "Data contoh sementara." : undefined}
      range={range}
      onRangeChange={setRange}
      isLoading={query.isLoading}
      isError={query.isError}
      errorMessage={query.error?.message}
      onRetry={() => void query.refetch()}
      isEmpty={false}
    >
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-64 w-full"
      >
        <AreaChart data={chartData} accessibilityLayer>
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
            dataKey="flame"
            type="monotone"
            stroke="var(--color-flame)"
            fill="var(--color-flame)"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Area
            dataKey="smoke"
            type="monotone"
            stroke="var(--color-smoke)"
            fill="var(--color-smoke)"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </AreaChart>
      </ChartContainer>
    </NodeTrendCard>
  )
}
