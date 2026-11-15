import type { Event, Severity } from "@/features/events/types"
import type { RiskLevel } from "@/features/telemetry/types"

export type DashboardSummary = {
  devices: {
    total: number
    online: number
    offline: number
  }
  risk: {
    counts: Record<RiskLevel, number>
  }
  active_events: {
    total: number
    by_severity: Record<Severity, number>
  }
  recent_events: Event[]
}
