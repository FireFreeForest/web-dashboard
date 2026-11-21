import {
  CloudFogIcon,
  FireIcon,
  HumidityIcon,
  InformationCircleIcon,
  Plant01Icon,
  PowerIcon,
  TemperatureIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { MetricTile } from "@/components/telemetry/metric-tile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  formatEventAdcPercent,
  formatEventFlameLevel,
  formatEventHumidity,
  formatEventTemperature,
  hasEventMetadata,
} from "@/features/events/metadata"
import type { EventDetail } from "@/features/events/types"
import { cn } from "@/lib/utils"

export function EventMetadataCard({ event }: { event: EventDetail }) {
  const metadata = event.metadata

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        {hasEventMetadata(metadata) ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {metadata?.temperature != null ? (
                <MetricTile
                  icon={TemperatureIcon}
                  label="Suhu"
                  value={formatEventTemperature(metadata.temperature)}
                  className="bg-orange-500/10"
                  iconClassName="text-orange-600 dark:text-orange-400"
                />
              ) : null}
              {metadata?.humidity != null ? (
                <MetricTile
                  icon={HumidityIcon}
                  label="Kelembapan"
                  value={formatEventHumidity(metadata.humidity)}
                  className="bg-sky-500/10"
                  iconClassName="text-sky-600 dark:text-sky-400"
                />
              ) : null}
              {metadata?.soil_moisture != null ? (
                <MetricTile
                  icon={Plant01Icon}
                  label="Kelembapan Tanah"
                  value={formatEventAdcPercent(metadata.soil_moisture)}
                  className="bg-emerald-500/10"
                  iconClassName="text-emerald-600 dark:text-emerald-400"
                />
              ) : null}
              {metadata?.flame_detected != null ||
              metadata?.flame_level != null ? (
                <MetricTile
                  icon={FireIcon}
                  label="Intensitas Api"
                  value={formatEventFlameLevel(metadata ?? {})}
                  className="bg-destructive/10"
                  iconClassName="text-destructive"
                />
              ) : null}
              {metadata?.smoke_level != null ? (
                <MetricTile
                  icon={CloudFogIcon}
                  label="Intensitas Asap"
                  value={formatEventAdcPercent(metadata.smoke_level)}
                  className="bg-amber-500/10"
                  iconClassName="text-amber-600 dark:text-amber-400"
                />
              ) : null}
              {metadata?.pump != null ? (
                <MetricTile
                  icon={PowerIcon}
                  label="Pompa Air"
                  value={metadata.pump ? "ON" : "OFF"}
                  className={cn(metadata.pump ? "bg-primary/10" : "bg-muted")}
                  iconClassName={
                    metadata.pump ? "text-primary" : "text-muted-foreground"
                  }
                  valueClassName={metadata.pump ? "text-primary" : undefined}
                />
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Snapshot terakhir yang diketahui saat event dibuat, bukan nilai
              pemicu.
            </p>
          </div>
        ) : (
          <Empty className="rounded-xl p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Metadata kosong</EmptyTitle>
              <EmptyDescription>
                Tidak ada data tambahan untuk event ini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
