import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useEnvironmentTelemetryAggregate } from "@/features/telemetry/queries"
import { adcToPercent, seriesPointTime } from "@/features/telemetry/utils"

import { NodeTrendCard } from "./node-trend-card"
import { formatTrendTime, formatTrendTooltipLabel } from "./node-trends-data"
import { useTrendRange } from "./use-trend-range"

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
  now,
}: {
  deviceId: string
  now: number
}) {
  const trend = useTrendRange(now)
  const query = useEnvironmentTelemetryAggregate(deviceId, {
    from: trend.rangeWindow.from,
    to: trend.rangeWindow.to,
    interval: trend.interval,
  })

  const points = useMemo(() => {
    const rows = query.data?.points ?? []

    return rows
      .map((row) => ({
        time: seriesPointTime(row),
        temperature: row.temperature,
        humidity: row.humidity,
        soil: adcToPercent(row.soil_moisture),
      }))
      .filter((point) => Number.isFinite(point.time))
  }, [query.data])

  const isEmpty = !query.isLoading && !query.isError && points.length === 0

  return (
    <NodeTrendCard
      title="Lingkungan"
      selection={trend.selection}
      onPresetChange={trend.setPreset}
      onCustomChange={trend.setCustom}
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
            tickFormatter={(value: number) =>
              formatTrendTime(value, trend.selection)
            }
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
                  formatTrendTooltipLabel(payload, trend.selection)
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
