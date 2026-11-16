import type { RiskLevel } from "@/features/telemetry/types"
import { cn } from "@/lib/utils"

export const riskMeta: Record<
  RiskLevel,
  { label: string; dotClassName: string; pillClassName: string }
> = {
  NORMAL: {
    label: "Normal",
    dotClassName: "bg-primary",
    pillClassName: "bg-primary/10 text-primary",
  },
  WASPADA: {
    label: "Waspada",
    dotClassName: "bg-amber-500",
    pillClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  BAHAYA: {
    label: "Bahaya",
    dotClassName: "bg-orange-500",
    pillClassName: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  DARURAT: {
    label: "Darurat",
    dotClassName: "bg-destructive",
    pillClassName: "bg-destructive/10 text-destructive",
  },
  UNKNOWN: {
    label: "Tidak Diketahui",
    dotClassName: "bg-muted-foreground",
    pillClassName: "bg-muted text-muted-foreground",
  },
}

export function RiskLevelPill({ level }: { level: RiskLevel }) {
  const meta = riskMeta[level]

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
