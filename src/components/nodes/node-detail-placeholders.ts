export type NodeHardware = {
  rssiDbm: number
  batteryPct: number
  voltageV: number
}

export const nodeHardwarePlaceholder: NodeHardware = {
  rssiDbm: -67,
  batteryPct: 76,
  voltageV: 4.12,
}
