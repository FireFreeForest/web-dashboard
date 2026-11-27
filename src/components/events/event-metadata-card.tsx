import {
  BatteryIcon,
  CloudFogIcon,
  CpuIcon,
  FireIcon,
  HumidityIcon,
  InformationCircleIcon,
  Plant01Icon,
  PowerIcon,
  SignalFull01Icon,
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
  formatEventBattery,
  formatEventFlameLevel,
  formatEventHumidity,
  formatEventRssi,
  formatEventTemperature,
  formatEventVoltage,
  hasEventMetadata,
} from "@/features/events/metadata"
import type { EventDetail } from "@/features/events/types"
import { cn, formatRelativeTime } from "@/lib/utils"

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
              {metadata?.battery_percentage != null ? (
                <MetricTile
                  icon={BatteryIcon}
                  label="Baterai"
                  value={formatEventBattery(metadata.battery_percentage)}
                  className="bg-muted"
                  iconClassName="text-muted-foreground"
                />
              ) : null}
              {metadata?.battery_voltage != null ? (
                <MetricTile
                  icon={BatteryIcon}
                  label="Tegangan"
                  value={formatEventVoltage(metadata.battery_voltage)}
                  className="bg-muted"
                  iconClassName="text-muted-foreground"
                />
              ) : null}
              {metadata?.wifi_rssi != null ? (
                <MetricTile
                  icon={SignalFull01Icon}
                  label="Sinyal"
                  value={formatEventRssi(metadata.wifi_rssi)}
                  className="bg-muted"
                  iconClassName="text-muted-foreground"
                />
              ) : null}
              {metadata?.firmware_version ? (
                <MetricTile
                  icon={CpuIcon}
                  label="Firmware"
                  value={metadata.firmware_version}
                  className="bg-muted"
                  iconClassName="text-muted-foreground"
                />
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Snapshot terakhir yang diketahui saat event dibuat, bukan nilai
              pemicu.
              {metadata?.metadata_source
                ? ` Sumber: ${metadata.metadata_source}.`
                : null}
              {metadata?.captured_at
                ? ` Diambil ${formatRelativeTime(metadata.captured_at)}.`
                : null}
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
