export type NodeHardware = {
  rssiDbm: number
  batteryPct: number
  voltageV: number
  uptime: string
}

export const nodeHardwarePlaceholder: NodeHardware = {
  rssiDbm: -67,
  batteryPct: 76,
  voltageV: 4.12,
  uptime: "3 hari 4 jam",
}
