import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartHistogramIcon } from "@hugeicons/core-free-icons"

import { DashboardOverview } from "@/components/dashboard/dashboard-summary"
import { NodeGroupMarker } from "@/components/dashboard/node-group-marker"
import { NodeMarker } from "@/components/dashboard/node-marker"
import { NodePopup } from "@/components/dashboard/node-popup"
import { useMapMode } from "@/components/providers/map-mode-provider"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Map, MapControls, useMap, type MapViewport } from "@/components/ui/map"
import { useSidebar } from "@/components/ui/sidebar"
import { forestNodes, groupForestNodes, type ForestNode } from "@/lib/nodes"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/")({
  staticData: { crumb: "Dashboard" },
  component: DashboardPage,
})

const MAP_CENTER: [number, number] = [113.9, 0.5]

function FlyToNode({ node }: { node?: ForestNode }) {
  const { map } = useMap()

  useEffect(() => {
    if (!map || !node) return
    map.flyTo({
      center: [node.coordinates.longitude, node.coordinates.latitude],
      zoom: 8,
      duration: 800,
      essential: true,
    })
  }, [map, node])

  return null
}

function MobileDashboardSummary() {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger
        render={
          <Button
            size="lg"
            className="absolute bottom-4 left-4 z-10 md:hidden"
          />
        }
      >
        <HugeiconsIcon
          icon={ChartHistogramIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Ringkasan
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Ringkasan dashboard</DrawerTitle>
          <DrawerDescription>
            Ringkasan sistem dan event terbaru.
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <DashboardOverview fluid />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function DashboardPage() {
  const { mapMode } = useMapMode()
  const { state: sidebarState } = useSidebar()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(6)

  const selected = forestNodes.find((node) => node.id === selectedId)

  const groups = useMemo(() => groupForestNodes(forestNodes, zoom), [zoom])

  const selectedGroup = selectedId
    ? groups.find((group) => group.nodes.some((node) => node.id === selectedId))
    : undefined
  const showPopup = selectedGroup?.nodes.length === 1

  const handleSelect = (node: ForestNode) => setSelectedId(node.id)

  const handleViewportChange = (viewport: MapViewport) => {
    const nextZoom = Math.round(viewport.zoom * 2) / 2
    setZoom(nextZoom)

    if (!selectedId) return

    const group = groupForestNodes(forestNodes, nextZoom).find((entry) =>
      entry.nodes.some((node) => node.id === selectedId)
    )
    if (group && group.nodes.length > 1) {
      setSelectedId(null)
    }
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0">
        <Map
          center={MAP_CENTER}
          zoom={6}
          minZoom={mapMode === "globe" ? 3 : 4}
          maxZoom={18}
          className="h-full w-full"
          projection={
            mapMode === "globe" ? { type: "globe" } : { type: "mercator" }
          }
          onViewportChange={handleViewportChange}
        >
          <FlyToNode node={selected} />
          {groups.map((group) =>
            group.nodes.length > 1 ? (
              <NodeGroupMarker
                key={group.id}
                group={group}
                onSelect={handleSelect}
              />
            ) : (
              <NodeMarker
                key={group.id}
                node={group.nodes[0]}
                active={group.nodes[0].id === selectedId}
                onSelect={() => handleSelect(group.nodes[0])}
              />
            )
          )}
          {selected && showPopup && (
            <NodePopup
              key={selected.id}
              node={selected}
              onClose={() => setSelectedId(null)}
            />
          )}
          <MapControls showCompass showFullscreen />
        </Map>
      </div>
      <div
        className={cn(
          "pointer-events-none absolute top-4 right-4 left-4 z-10 hidden max-h-[calc(100%-2rem)] overflow-y-auto sm:top-6 sm:right-6 md:block",
          sidebarState === "collapsed"
            ? "md:left-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px+(--spacing(6)))]"
            : "md:left-[calc(var(--sidebar-width)+(--spacing(6)))]"
        )}
      >
        <DashboardOverview />
      </div>
      <MobileDashboardSummary />
    </div>
  )
}
