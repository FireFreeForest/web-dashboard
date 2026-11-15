import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ServerStackIcon } from "@hugeicons/core-free-icons"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const Route = createFileRoute("/_app/nodes")({
  staticData: { crumb: "Nodes" },
  component: NodesPage,
})

function NodesPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={ServerStackIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>No nodes yet</EmptyTitle>
          <EmptyDescription>
            Node management will appear here once devices are connected.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
