import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { cn } from "@/lib/utils"

export function MetricTile({
  icon,
  label,
  value,
  size = "default",
  className,
  iconClassName,
  valueClassName,
}: {
  icon: IconSvgElement
  label: string
  value: string
  size?: "sm" | "default"
  className?: string
  iconClassName?: string
  valueClassName?: string
}) {
  const isSmall = size === "sm"

  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col rounded-lg p-2.5",
        isSmall ? "gap-0.5" : "gap-1",
        className
      )}
    >
      <HugeiconsIcon
        icon={icon}
        strokeWidth={2}
        className={cn("size-4", iconClassName)}
      />
      <span
        className={cn(
          "truncate font-semibold tabular-nums",
          isSmall ? "text-sm" : "text-base",
          valueClassName
        )}
      >
        {value}
      </span>
      <span
        title={label}
        className={cn(
          "truncate text-muted-foreground",
          isSmall ? "text-[10px] leading-none" : "text-sm leading-tight"
        )}
      >
        {label}
      </span>
    </div>
  )
}
