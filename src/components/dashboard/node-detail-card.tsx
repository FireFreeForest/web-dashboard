import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  ExternalLinkIcon,
  HumidityIcon,
  Location01Icon,
  Plant01Icon,
  PowerIcon,
  RadioTowerIcon,
  TemperatureIcon,
} from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import { MetricTile } from "@/components/telemetry/metric-tile"
import { Button } from "@/components/ui/button"
import {
  getNodeStatus,
  nodeStatusMeta,
  type MapNode,
  type PumpState,
} from "@/lib/nodes"
import { cn, formatRelativeTime, formatTemperature } from "@/lib/utils"

function IntensityBar({
  label,
  value,
  barClassName,
}: {
  label: string
  value: number | null
  barClassName: string
}) {
  const normalized = value === null ? null : Math.min(Math.max(value, 0), 100)

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", barClassName)}
            style={{ width: `${normalized ?? 0}%` }}
          />
        </div>
        <span className="w-9 text-right text-xs font-medium tabular-nums">
          {normalized === null ? "—" : `${Math.round(normalized)}%`}
        </span>
      </div>
    </div>
  )
}

function PumpPill({ state }: { state: PumpState | null }) {
  const isOn = state === "on"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        isOn ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}
    >
      <HugeiconsIcon icon={PowerIcon} strokeWidth={2} className="size-3" />
      {state === null ? "—" : isOn ? "ON" : "OFF"}
    </span>
  )
}

export function NodeDetailCard({ node }: { node: MapNode }) {
  const status = getNodeStatus(node)
  const meta = nodeStatusMeta[status]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5 pr-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <HugeiconsIcon
            icon={RadioTowerIcon}
            strokeWidth={2}
            className="size-5 text-muted-foreground"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="truncate font-heading text-sm leading-tight font-semibold">
              {node.name}
            </p>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                meta.pillClassName
              )}
            >
              <span
                className={cn("size-1.5 rounded-full", meta.dotClassName)}
              />
              {meta.label}
            </span>
          </div>
          <span className="font-mono text-[11px] leading-none tracking-wide text-muted-foreground">
            {node.id}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1">
          <HugeiconsIcon
            icon={Location01Icon}
            strokeWidth={2}
            className="size-3 shrink-0"
          />
          <span className="truncate">{node.region}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <HugeiconsIcon
            icon={Clock01Icon}
            strokeWidth={2}
            className="size-3"
          />
          {formatRelativeTime(node.lastSeen)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetricTile
          size="sm"
          icon={TemperatureIcon}
          label="Suhu"
          value={formatTemperature(node.environment.temperatureC)}
          className="bg-orange-500/10"
          iconClassName="text-orange-600 dark:text-orange-400"
        />
        <MetricTile
          size="sm"
          icon={HumidityIcon}
          label="Kelembapan"
          value={
            node.environment.humidityPct !== null
              ? `${Math.round(node.environment.humidityPct)}%`
              : "—"
          }
          className="bg-sky-500/10"
          iconClassName="text-sky-600 dark:text-sky-400"
        />
        <MetricTile
          size="sm"
          icon={Plant01Icon}
          label="Kelembapan Tanah"
          value={
            node.environment.soilMoisturePct !== null
              ? `${node.environment.soilMoisturePct}%`
              : "—"
          }
          className="bg-emerald-500/10"
          iconClassName="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <IntensityBar
          label="Intensitas Api"
          value={node.fire.fireIntensity}
          barClassName={meta.barClassName}
        />
        <IntensityBar
          label="Intensitas Asap"
          value={node.fire.smokeIntensity}
          barClassName={meta.barClassName}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Pompa Air</span>
        <PumpPill state={node.actuator.pumpState} />
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full"
        render={<Link to="/nodes/$deviceId" params={{ deviceId: node.id }} />}
      >
        Detail
        <HugeiconsIcon icon={ExternalLinkIcon} data-icon="inline-end" />
      </Button>
    </div>
  )
}
