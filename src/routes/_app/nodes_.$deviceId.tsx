import { createFileRoute } from "@tanstack/react-router"

import { NodeDetailPage } from "@/components/nodes/node-detail-page"

export const Route = createFileRoute("/_app/nodes_/$deviceId")({
  staticData: { crumb: "Node Detail" },
  component: NodeDetailRoute,
})

function NodeDetailRoute() {
  const { deviceId } = Route.useParams()

  return <NodeDetailPage deviceId={deviceId} />
}
