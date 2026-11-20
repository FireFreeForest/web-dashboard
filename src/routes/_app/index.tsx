import { useEffect, useMemo, useRef, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"

import {
  DashboardMobileSummary,
  DashboardOverview,
} from "@/components/dashboard/dashboard-summary"
import { NodeGroupMarker } from "@/components/dashboard/node-group-marker"
import { NodeMarker } from "@/components/dashboard/node-marker"
import { NodePopup } from "@/components/dashboard/node-popup"
import { useMapMode } from "@/components/providers/map-mode-provider"
import { Button } from "@/components/ui/button"
import { Map, MapControls, useMap, type MapViewport } from "@/components/ui/map"
import { useSidebar } from "@/components/ui/sidebar"
import { useMapNodes } from "@/features/dashboard/map-nodes"
import { groupMapNodes, type MapNode } from "@/lib/nodes"
import { pageTitle } from "@/lib/site"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/")({
  staticData: { crumb: "Beranda" },
  head: () => ({
    meta: [{ title: pageTitle("Beranda") }],
  }),
  component: DashboardPage,
})

const MAP_CENTER: [number, number] = [113.9, 0.5]
const MAP_DEFAULT_ZOOM = 6
const AUTO_FIT_MAX_ZOOM = 12
const AUTO_FIT_PADDING = 64
const NODE_FOCUS_ZOOM = 14

function AutoFitNodes({ nodes }: { nodes: MapNode[] }) {
  const { map } = useMap()
  const fittedRef = useRef(false)

  useEffect(() => {
    fittedRef.current = false
  }, [map])

  useEffect(() => {
    if (!map || fittedRef.current || nodes.length === 0) return

    fittedRef.current = true
    const [first] = nodes

    if (nodes.length === 1) {
      map.flyTo({
        center: [first.coordinates.longitude, first.coordinates.latitude],
        zoom: MAP_DEFAULT_ZOOM,
        duration: 800,
        essential: true,
      })
      return
    }

    let minLng = first.coordinates.longitude
    let maxLng = minLng
    let minLat = first.coordinates.latitude
    let maxLat = minLat

    for (const { coordinates } of nodes) {
      minLng = Math.min(minLng, coordinates.longitude)
      maxLng = Math.max(maxLng, coordinates.longitude)
      minLat = Math.min(minLat, coordinates.latitude)
      maxLat = Math.max(maxLat, coordinates.latitude)
    }

    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: AUTO_FIT_PADDING,
        maxZoom: AUTO_FIT_MAX_ZOOM,
        duration: 800,
      }
    )
  }, [map, nodes])

  return null
}

function FlyToNode({ node }: { node?: MapNode }) {
  const { map } = useMap()
  const nodeId = node?.id
  const longitude = node?.coordinates.longitude
  const latitude = node?.coordinates.latitude

  useEffect(() => {
    if (!map || latitude === undefined || longitude === undefined) return

    map.flyTo({
      center: [longitude, latitude],
      zoom: Math.max(map.getZoom(), NODE_FOCUS_ZOOM),
      duration: 800,
      essential: true,
    })
  }, [map, nodeId, latitude, longitude])

  return null
}

function MapNodesStatus({
  isLoading,
  errorMessage,
  empty,
  onRetry,
}: {
  isLoading: boolean
  errorMessage: string | null
  empty: boolean
  onRetry: () => void
}) {
  if (!isLoading && !errorMessage && !empty) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-background/95 px-4 py-2 text-sm shadow-lg backdrop-blur">
        {isLoading ? (
          <span className="text-muted-foreground">Memuat Device...</span>
        ) : errorMessage ? (
          <>
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={2}
              className="size-4 text-destructive"
            />
            <span className="max-w-80 truncate text-muted-foreground">
              {errorMessage}
            </span>
            <Button
              size="xs"
              variant="outline"
              onClick={onRetry}
              className="shrink-0"
            >
              <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
              Coba lagi
            </Button>
          </>
        ) : (
          <span className="text-muted-foreground">
            Belum ada Device dengan koordinat.
          </span>
        )}
      </div>
    </div>
  )
}

function DashboardPage() {
  const { mapMode } = useMapMode()
  const { state: sidebarState } = useSidebar()
  const { nodes, isLoading, isError, error, refetch } = useMapNodes()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(6)

  const selected = nodes.find((node) => node.id === selectedId)

  const groups = useMemo(() => groupMapNodes(nodes, zoom), [nodes, zoom])

  const selectedGroup = selectedId
    ? groups.find((group) => group.nodes.some((node) => node.id === selectedId))
    : undefined
  const showPopup = selectedGroup?.nodes.length === 1

  const handleSelect = (node: MapNode) => setSelectedId(node.id)

  const handleViewportChange = (viewport: MapViewport) => {
    const nextZoom = Math.round(viewport.zoom * 2) / 2
    setZoom(nextZoom)

    if (!selectedId) return

    const group = groupMapNodes(nodes, nextZoom).find((entry) =>
      entry.nodes.some((node) => node.id === selectedId)
    )
    if (group && group.nodes.length > 1) {
      setSelectedId(null)
    }
  }

  const nodesError =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Gagal memuat Device."
        : null

  return (
    <div className="relative flex-1 overflow-hidden md:fixed md:inset-0 md:z-0">
      <div className="absolute inset-0">
        <Map
          center={MAP_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          minZoom={mapMode === "globe" ? 3 : 4}
          maxZoom={18}
          className="h-full w-full"
          projection={
            mapMode === "globe" ? { type: "globe" } : { type: "mercator" }
          }
          onViewportChange={handleViewportChange}
        >
          <AutoFitNodes nodes={nodes} />
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
          "pointer-events-none absolute top-1 right-1 left-1 z-10 hidden max-h-[calc(100%-2rem)] overflow-y-auto p-3 pb-6 transition-[left] duration-200 ease-linear sm:top-3 sm:right-3 md:block",
          sidebarState === "collapsed"
            ? "md:left-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px+(--spacing(3)))]"
            : "md:left-[calc(var(--sidebar-width)+(--spacing(3)))]"
        )}
      >
        <DashboardOverview />
      </div>
      <div className="pointer-events-none absolute top-3 left-3 z-10 md:hidden">
        <div className="pointer-events-auto">
          <DashboardMobileSummary />
        </div>
      </div>
      <MapNodesStatus
        isLoading={isLoading}
        errorMessage={nodesError}
        empty={nodes.length === 0}
        onRetry={() => void refetch()}
      />
    </div>
  )
}
