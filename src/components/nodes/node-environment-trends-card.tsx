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
import { useEnvironmentTelemetry } from "@/features/telemetry/queries"
import { adcToPercent } from "@/features/telemetry/utils"

import { NodeTrendCard } from "./node-trend-card"
import {
  createDummyEnvironmentTrend,
  formatTrendTime,
  formatTrendTooltipLabel,
  getRangeStart,
  type TrendRange,
} from "./node-trends-data"

const chartConfig = {
  temperature: {
    label: "Suhu (°C)",
    color: "var(--chart-temperature)",
  },
  humidity: {
    label: "Kelembapan (%)",
    color: "var(--chart-humidity)",
  },
  soil: {
    label: "Tanah (%)",
    color: "var(--chart-soil)",
  },
} satisfies ChartConfig

export function NodeEnvironmentTrendsCard({
  deviceId,
}: {
  deviceId: string
}) {
  const [range, setRange] = useState<TrendRange>("24H")
  const from = useMemo(() => getRangeStart(range).toISOString(), [range])
  const query = useEnvironmentTelemetry(deviceId, {
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
        temperature: row.temperature,
        humidity: row.humidity,
        soil: adcToPercent(row.soil_moisture),
      }))
      .filter((point) => Number.isFinite(point.time))
  }, [query.data])

  const demoPoints = useMemo(
    () => createDummyEnvironmentTrend(range),
    [range]
  )
  const isDummy = !query.isLoading && !query.isError && points.length === 0
  const chartData = isDummy ? demoPoints : points

  return (
    <NodeTrendCard
      title="Environment Trends"
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
            yAxisId="temperature"
            tickLine={false}
            axisLine={false}
            width={36}
            domain={[0, 50]}
            tickFormatter={(value: number) => `${value}°`}
          />
          <YAxis
            yAxisId="percent"
            orientation="right"
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
            yAxisId="temperature"
            dataKey="temperature"
            type="monotone"
            stroke="var(--color-temperature)"
            fill="var(--color-temperature)"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Area
            yAxisId="percent"
            dataKey="humidity"
            type="monotone"
            stroke="var(--color-humidity)"
            fill="var(--color-humidity)"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Area
            yAxisId="percent"
            dataKey="soil"
            type="monotone"
            stroke="var(--color-soil)"
            fill="var(--color-soil)"
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
