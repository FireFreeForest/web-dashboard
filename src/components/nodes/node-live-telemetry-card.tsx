import {
  CloudFogIcon,
  FireIcon,
  HumidityIcon,
  Plant01Icon,
  PowerIcon,
  TemperatureIcon,
} from "@hugeicons/core-free-icons"

import { MetricTile } from "@/components/telemetry/metric-tile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  EnvironmentTelemetry,
  FireTelemetry,
} from "@/features/telemetry/types"
import { adcToInvertedPercent, adcToPercent } from "@/features/telemetry/utils"
import { cn, formatTemperature } from "@/lib/utils"

const groupLabelClassName =
  "text-sm font-medium text-muted-foreground lg:row-start-1"

export function NodeLiveTelemetryCard({
  environment,
  fire,
}: {
  environment: EnvironmentTelemetry | null
  fire: FireTelemetry | null
}) {
  const flameValue =
    fire?.flame_level != null
      ? `${adcToInvertedPercent(fire.flame_level)}%`
      : fire?.flame_detected
        ? "Terdeteksi"
        : "—"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telemetri</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 lg:grid-cols-6">
        <span
          className={cn(groupLabelClassName, "lg:col-span-3 lg:col-start-1")}
        >
          Lingkungan
        </span>
        <MetricTile
          icon={TemperatureIcon}
          label="Suhu"
          value={formatTemperature(environment?.temperature)}
          className="bg-orange-500/10 lg:col-span-1 lg:col-start-1 lg:row-start-2"
          iconClassName="text-orange-600 dark:text-orange-400"
        />
        <MetricTile
          icon={HumidityIcon}
          label="Kelembapan"
          value={
            environment?.humidity != null ? `${environment.humidity}%` : "—"
          }
          className="bg-sky-500/10 lg:col-span-1 lg:col-start-2 lg:row-start-2"
          iconClassName="text-sky-600 dark:text-sky-400"
        />
        <MetricTile
          icon={Plant01Icon}
          label="Kelembapan Tanah"
          value={
            environment ? `${adcToPercent(environment.soil_moisture)}%` : "—"
          }
          className="bg-emerald-500/10 lg:col-span-1 lg:col-start-3 lg:row-start-2"
          iconClassName="text-emerald-600 dark:text-emerald-400"
        />

        <span
          className={cn(
            groupLabelClassName,
            "pt-2 lg:col-span-2 lg:col-start-4 lg:pt-0"
          )}
        >
          Deteksi Api
        </span>
        <MetricTile
          icon={FireIcon}
          label="Intensitas Api"
          value={flameValue}
          className="bg-destructive/10 lg:col-span-1 lg:col-start-4 lg:row-start-2"
          iconClassName="text-destructive"
        />
        <MetricTile
          icon={CloudFogIcon}
          label="Intensitas Asap"
          value={fire ? `${adcToPercent(fire.smoke_level)}%` : "—"}
          className="bg-amber-500/10 lg:col-span-1 lg:col-start-5 lg:row-start-2"
          iconClassName="text-amber-600 dark:text-amber-400"
        />

        <span
          className={cn(
            groupLabelClassName,
            "pt-2 lg:col-span-1 lg:col-start-6 lg:pt-0"
          )}
        >
          Aktuator
        </span>
        <MetricTile
          icon={PowerIcon}
          label="Pompa Air"
          value={fire ? (fire.pump ? "ON" : "OFF") : "—"}
          className={cn(
            "lg:col-span-1 lg:col-start-6 lg:row-start-2",
            fire?.pump ? "bg-primary/10" : "bg-muted"
          )}
          iconClassName={fire?.pump ? "text-primary" : "text-muted-foreground"}
          valueClassName={fire?.pump ? "text-primary" : undefined}
        />
      </CardContent>
    </Card>
  )
}
