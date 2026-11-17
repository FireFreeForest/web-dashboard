import type { RiskLevel } from "@/features/telemetry/types"

export type PumpState = "on" | "off"

export type NodeStatus =
  "normal" | "warning" | "critical" | "offline" | "unknown"

export type MapNode = {
  id: string
  name: string
  region: string
  coordinates: {
    longitude: number
    latitude: number
  }
  environment: {
    temperatureC: number | null
    humidityPct: number | null
    soilMoisturePct: number | null
  }
  fire: {
    fireIntensity: number | null
    smokeIntensity: number | null
  }
  actuator: {
    pumpState: PumpState | null
  }
  online: boolean
  riskLevel: RiskLevel
  lastSeen: string | null
}

export type NodeGroup = {
  id: string
  longitude: number
  latitude: number
  nodes: MapNode[]
}

const WORLD_SIZE_PX = 512

export function groupMapNodes(
  nodes: MapNode[],
  zoom: number,
  spacingPx = 60
): NodeGroup[] {
  const spacing = (spacingPx / (WORLD_SIZE_PX * 2 ** zoom)) * 360
  const groups: NodeGroup[] = []

  for (const node of nodes) {
    const { longitude, latitude } = node.coordinates

    const group = groups.find(({ longitude: lng, latitude: lat }) => {
      const dx = (longitude - lng) * Math.cos((lat * Math.PI) / 180)
      return Math.hypot(dx, latitude - lat) < spacing
    })

    if (!group) {
      groups.push({
        id: node.id,
        longitude,
        latitude,
        nodes: [node],
      })
      continue
    }

    const count = group.nodes.push(node)
    group.longitude += (longitude - group.longitude) / count
    group.latitude += (latitude - group.latitude) / count
  }

  return groups.map((group) => ({
    ...group,
    id: group.nodes
      .map((node) => node.id)
      .sort()
      .join("|"),
  }))
}

const statusPriority: Record<NodeStatus, number> = {
  critical: 4,
  warning: 3,
  unknown: 2,
  normal: 1,
  offline: 0,
}

export function getGroupStatus(nodes: MapNode[]): NodeStatus {
  return nodes.reduce<NodeStatus>((worst, node) => {
    const status = getNodeStatus(node)
    return statusPriority[status] > statusPriority[worst] ? status : worst
  }, "offline")
}

export function getNodeStatus(node: MapNode): NodeStatus {
  if (!node.online) {
    return "offline"
  }

  switch (node.riskLevel) {
    case "NORMAL":
      return "normal"
    case "WASPADA":
      return "warning"
    case "BAHAYA":
    case "DARURAT":
      return "critical"
    case "UNKNOWN":
      return "unknown"
    default:
      return "unknown"
  }
}

export const nodeStatusMeta: Record<
  NodeStatus,
  {
    label: string
    dotClassName: string
    barClassName: string
    pillClassName: string
  }
> = {
  normal: {
    label: "Normal",
    dotClassName: "bg-primary",
    barClassName: "bg-primary",
    pillClassName: "bg-primary/10 text-primary",
  },
  warning: {
    label: "Warning",
    dotClassName: "bg-amber-500",
    barClassName: "bg-amber-500",
    pillClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  critical: {
    label: "Critical",
    dotClassName: "bg-destructive",
    barClassName: "bg-destructive",
    pillClassName: "bg-destructive/10 text-destructive",
  },
  offline: {
    label: "Offline",
    dotClassName: "bg-muted-foreground",
    barClassName: "bg-muted-foreground",
    pillClassName: "bg-muted text-muted-foreground",
  },
  unknown: {
    label: "Tidak diketahui",
    dotClassName: "bg-muted-foreground",
    barClassName: "bg-muted-foreground",
    pillClassName: "bg-muted text-muted-foreground",
  },
}
