import { MapPopup } from "@/components/ui/map"
import { NodeDetailCard } from "@/components/dashboard/node-detail-card"
import type { MapNode } from "@/lib/nodes"

export function NodePopup({
  node,
  onClose,
}: {
  node: MapNode
  onClose: () => void
}) {
  return (
    <MapPopup
      longitude={node.coordinates.longitude}
      latitude={node.coordinates.latitude}
      offset={26}
      closeButton
      closeOnClick={false}
      focusAfterOpen={false}
      onClose={onClose}
      className="w-80 max-w-[calc(100vw-3rem)]"
    >
      <NodeDetailCard node={node} />
    </MapPopup>
  )
}
