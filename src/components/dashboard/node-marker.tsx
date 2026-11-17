import { HugeiconsIcon } from "@hugeicons/react"
import { RadioTowerIcon } from "@hugeicons/core-free-icons"

import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map"
import { getNodeStatus, nodeStatusMeta, type MapNode } from "@/lib/nodes"
import { cn } from "@/lib/utils"

export function NodeMarker({
  node,
  active,
  onSelect,
}: {
  node: MapNode
  active: boolean
  onSelect: () => void
}) {
  const status = getNodeStatus(node)
  const meta = nodeStatusMeta[status]

  return (
    <MapMarker
      longitude={node.coordinates.longitude}
      latitude={node.coordinates.latitude}
      onClick={onSelect}
    >
      <MarkerContent>
        <div className="group relative flex size-9 items-center justify-center">
          {status === "critical" ? (
            <span className="absolute inset-0 animate-ping rounded-full border-2 border-destructive/40 opacity-60" />
          ) : null}
          <span
            className={cn(
              "relative flex items-center justify-center rounded-full text-white shadow-md transition-all",
              active ? "size-9 scale-110" : "size-7 group-hover:scale-110",
              meta.dotClassName,
              status === "offline" && "opacity-70"
            )}
          >
            <HugeiconsIcon
              icon={RadioTowerIcon}
              strokeWidth={2}
              className={active ? "size-4.5" : "size-3.5"}
            />
          </span>
        </div>
      </MarkerContent>
      <MarkerTooltip
        offset={22}
        className="min-w-28 border bg-popover p-2 text-popover-foreground"
      >
        <div className="flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", meta.dotClassName)} />
          <span className="text-[11px] font-medium">{node.name}</span>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground uppercase">
            {node.id}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span>{node.region}</span>
          <span className="tabular-nums">{meta.label}</span>
        </div>
      </MarkerTooltip>
    </MapMarker>
  )
}
