import { HugeiconsIcon } from "@hugeicons/react"
import { RadioTowerIcon } from "@hugeicons/core-free-icons"

export function DeviceLocationMarker() {
  return (
    <div className="group relative flex size-9 items-center justify-center">
      <span className="relative flex size-7 items-center justify-center rounded-full bg-primary text-white shadow-md transition-all group-hover:scale-110">
        <HugeiconsIcon
          icon={RadioTowerIcon}
          strokeWidth={2}
          className="size-3.5"
        />
      </span>
    </div>
  )
}
