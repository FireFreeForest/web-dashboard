import { HugeiconsIcon } from "@hugeicons/react"
import { RadioTowerIcon } from "@hugeicons/core-free-icons"

import {
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  useMap,
} from "@/components/ui/map"
import {
  getGroupStatus,
  getNodeStatus,
  nodeStatusMeta,
  type MapNode,
  type NodeGroup,
} from "@/lib/nodes"
import { cn } from "@/lib/utils"

export function NodeGroupMarker({
  group,
  onSelect,
}: {
  group: NodeGroup
  onSelect: (node: MapNode) => void
}) {
  const { map } = useMap()
  const [lead] = group.nodes
  const count = group.nodes.length
  const status = getGroupStatus(group.nodes)
  const meta = nodeStatusMeta[status]

  const handleClick = () => {
    if (!map || count === 1 || map.getZoom() >= map.getMaxZoom()) {
      onSelect(lead)
      return
    }

    map.flyTo({
      center: [group.longitude, group.latitude],
      zoom: Math.min(map.getZoom() + 2, map.getMaxZoom()),
      duration: 600,
      essential: true,
    })
  }

  return (
    <MapMarker
      longitude={group.longitude}
      latitude={group.latitude}
      onClick={handleClick}
    >
      <MarkerContent>
        <div className="group relative flex size-9 items-center justify-center">
          {status === "critical" ? (
            <span className="absolute inset-0 animate-ping rounded-full border-2 border-destructive/40 opacity-60" />
          ) : null}
          <span
            className={cn(
              "relative flex items-center justify-center rounded-full text-white shadow-md transition-all",
              "size-7 group-hover:scale-110",
              meta.dotClassName,
              status === "offline" && "opacity-70"
            )}
          >
            <HugeiconsIcon
              icon={RadioTowerIcon}
              strokeWidth={2}
              className="size-3.5"
            />
          </span>
          {count > 1 ? (
            <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background tabular-nums ring-2 ring-background">
              {count}
            </span>
          ) : null}
        </div>
      </MarkerContent>
      <MarkerTooltip
        offset={22}
        className="min-w-40 border bg-popover p-2 text-popover-foreground"
      >
        <div className="space-y-1.5">
          {group.nodes.map((node) => {
            const nodeStatus = getNodeStatus(node)
            const nodeMeta = nodeStatusMeta[nodeStatus]

            return (
              <div key={node.id} className="text-[11px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{node.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    {node.id}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-3 text-muted-foreground">
                  <span>{node.region}</span>
                  <span className="flex items-center gap-1">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        nodeMeta.dotClassName
                      )}
                    />
                    {nodeMeta.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </MarkerTooltip>
    </MapMarker>
  )
}
