import type { QueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { NodeDetailPage } from "@/components/nodes/node-detail-page"
import { deviceStatusQueryOptions } from "@/features/devices/queries"
import { pageTitle } from "@/lib/site"

type NodeDetailLoaderContext = {
  params: { deviceId: string }
  context: { queryClient: QueryClient }
}

type NodeDetailHeadContext = {
  loaderData?: string | null
}

export const Route = createFileRoute("/_app/nodes_/$deviceId")({
  staticData: { crumb: "Detail Device" },
  loader: async ({ params, context }: NodeDetailLoaderContext) => {
    try {
      const status = await context.queryClient.ensureQueryData(
        deviceStatusQueryOptions(params.deviceId)
      )

      return status.device.name
    } catch {
      return null
    }
  },
  head: ({ loaderData }: NodeDetailHeadContext) => ({
    meta: [{ title: pageTitle(loaderData ?? "Detail Device") }],
  }),
  component: NodeDetailRoute,
})

function NodeDetailRoute() {
  const { deviceId } = Route.useParams()

  return <NodeDetailPage deviceId={deviceId} />
}
