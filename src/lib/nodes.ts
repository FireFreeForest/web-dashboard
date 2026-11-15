export type PumpState = "on" | "off"

export type NodeStatus = "normal" | "warning" | "critical" | "offline"

export type ForestNode = {
  id: string
  name: string
  region: string
  coordinates: {
    longitude: number
    latitude: number
  }
  environment: {
    temperatureC: number
    humidityPct: number
    soilMoisturePct: number
  }
  fire: {
    fireIntensity: number
    smokeIntensity: number
  }
  actuator: {
    pumpState: PumpState
  }
  online: boolean
  lastSeen: string
}

export const forestNodes: ForestNode[] = [
  {
    id: "FFF-KTG-001",
    name: "Ketapang Ridge Station",
    region: "West Kalimantan",
    coordinates: { longitude: 109.98, latitude: -1.84 },
    environment: { temperatureC: 30.2, humidityPct: 78, soilMoisturePct: 54 },
    fire: { fireIntensity: 12, smokeIntensity: 8 },
    actuator: { pumpState: "off" },
    online: true,
    lastSeen: "2 min ago",
  },
  {
    id: "FFF-PTK-002",
    name: "Pontianak Peat Station",
    region: "West Kalimantan",
    coordinates: { longitude: 109.34, latitude: -0.03 },
    environment: { temperatureC: 32.8, humidityPct: 64, soilMoisturePct: 41 },
    fire: { fireIntensity: 34, smokeIntensity: 57 },
    actuator: { pumpState: "off" },
    online: true,
    lastSeen: "1 min ago",
  },
  {
    id: "FFF-STG-003",
    name: "Sintang Forest Station",
    region: "West Kalimantan",
    coordinates: { longitude: 111.49, latitude: 0.08 },
    environment: { temperatureC: 29.4, humidityPct: 82, soilMoisturePct: 63 },
    fire: { fireIntensity: 4, smokeIntensity: 3 },
    actuator: { pumpState: "off" },
    online: true,
    lastSeen: "5 min ago",
  },
  {
    id: "FFF-PRY-004",
    name: "Palangka Raya Station",
    region: "Central Kalimantan",
    coordinates: { longitude: 113.91, latitude: -2.21 },
    environment: { temperatureC: 35.6, humidityPct: 49, soilMoisturePct: 18 },
    fire: { fireIntensity: 71, smokeIntensity: 83 },
    actuator: { pumpState: "on" },
    online: true,
    lastSeen: "just now",
  },
  {
    id: "FFF-SPT-005",
    name: "Sampit Peatland Station",
    region: "Central Kalimantan",
    coordinates: { longitude: 112.95, latitude: -2.54 },
    environment: { temperatureC: 36.9, humidityPct: 45, soilMoisturePct: 14 },
    fire: { fireIntensity: 86, smokeIntensity: 91 },
    actuator: { pumpState: "on" },
    online: true,
    lastSeen: "just now",
  },
  {
    id: "FFF-BJM-006",
    name: "Banjarmasin Station",
    region: "South Kalimantan",
    coordinates: { longitude: 114.59, latitude: -3.32 },
    environment: { temperatureC: 31.1, humidityPct: 74, soilMoisturePct: 48 },
    fire: { fireIntensity: 9, smokeIntensity: 12 },
    actuator: { pumpState: "off" },
    online: true,
    lastSeen: "3 min ago",
  },
  {
    id: "FFF-KTB-007",
    name: "Kotabaru Coastal Station",
    region: "South Kalimantan",
    coordinates: { longitude: 116.22, latitude: -3.24 },
    environment: { temperatureC: 33.7, humidityPct: 58, soilMoisturePct: 26 },
    fire: { fireIntensity: 42, smokeIntensity: 38 },
    actuator: { pumpState: "off" },
    online: true,
    lastSeen: "7 min ago",
  },
  {
    id: "FFF-BPP-008",
    name: "Balikpapan Station",
    region: "East Kalimantan",
    coordinates: { longitude: 116.85, latitude: -1.24 },
    environment: { temperatureC: 30.8, humidityPct: 76, soilMoisturePct: 57 },
    fire: { fireIntensity: 7, smokeIntensity: 6 },
    actuator: { pumpState: "off" },
    online: true,
    lastSeen: "4 min ago",
  },
  {
    id: "FFF-SMD-009",
    name: "Samarinda Station",
    region: "East Kalimantan",
    coordinates: { longitude: 117.15, latitude: -0.5 },
    environment: { temperatureC: 34.2, humidityPct: 55, soilMoisturePct: 31 },
    fire: { fireIntensity: 51, smokeIntensity: 62 },
    actuator: { pumpState: "on" },
    online: true,
    lastSeen: "6 min ago",
  },
  {
    id: "FFF-TJS-010",
    name: "Tanjung Selor Station",
    region: "North Kalimantan",
    coordinates: { longitude: 117.5, latitude: 2.84 },
    environment: { temperatureC: 28.6, humidityPct: 84, soilMoisturePct: 69 },
    fire: { fireIntensity: 3, smokeIntensity: 2 },
    actuator: { pumpState: "off" },
    online: false,
    lastSeen: "2 hours ago",
  },
]

export type NodeGroup = {
  id: string
  longitude: number
  latitude: number
  nodes: ForestNode[]
}

const WORLD_SIZE_PX = 512

export function groupForestNodes(
  nodes: ForestNode[],
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
  critical: 3,
  warning: 2,
  normal: 1,
  offline: 0,
}

export function getGroupStatus(nodes: ForestNode[]): NodeStatus {
  return nodes.reduce<NodeStatus>((worst, node) => {
    const status = getNodeStatus(node)
    return statusPriority[status] > statusPriority[worst] ? status : worst
  }, "offline")
}

export function getNodeStatus(node: ForestNode): NodeStatus {
  if (!node.online) {
    return "offline"
  }

  if (node.fire.fireIntensity >= 60 || node.environment.temperatureC >= 45) {
    return "critical"
  }

  if (
    node.fire.fireIntensity >= 30 ||
    node.fire.smokeIntensity >= 50 ||
    node.environment.soilMoisturePct < 20
  ) {
    return "warning"
  }

  return "normal"
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
}
