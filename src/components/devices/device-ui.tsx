import type { DeviceStatus } from "@/features/devices/types"
import { cn } from "@/lib/utils"

export const statusMeta: Record<
  DeviceStatus,
  { label: string; dotClassName: string; pillClassName: string }
> = {
  online: {
    label: "Online",
    dotClassName: "bg-primary",
    pillClassName: "bg-primary/10 text-primary",
  },
  offline: {
    label: "Offline",
    dotClassName: "bg-muted-foreground",
    pillClassName: "bg-muted text-muted-foreground",
  },
}

export function DeviceStatusPill({ status }: { status: DeviceStatus }) {
  const meta = statusMeta[status]

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        meta.pillClassName
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClassName)} />
      {meta.label}
    </span>
  )
}
