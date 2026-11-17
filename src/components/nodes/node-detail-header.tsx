import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  Delete02Icon,
  Edit02Icon,
  Location01Icon,
  MoreHorizontalCircle01Icon,
  RadioTowerIcon,
} from "@hugeicons/core-free-icons"
import { Link, useNavigate } from "@tanstack/react-router"

import { RiskLevelPill } from "@/components/telemetry/risk-level-pill"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteDeviceDialog } from "@/components/devices/delete-device-dialog"
import { EditDeviceDialog } from "@/components/devices/edit-device-dialog"
import { useMe } from "@/features/auth/queries"
import type { Device } from "@/features/devices/types"
import type { RiskLevel } from "@/features/telemetry/types"
import { formatRelativeTime } from "@/lib/utils"

export function NodeDetailHeader({
  device,
  riskLevel,
  lastSeenAt,
}: {
  device: Device
  riskLevel: RiskLevel
  lastSeenAt: string | null
}) {
  const { data: user } = useMe()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isAdmin = user?.role === "admin"

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/nodes" />}>
              Device
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{device.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <HugeiconsIcon
              icon={RadioTowerIcon}
              strokeWidth={2}
              className="size-6 text-muted-foreground"
            />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">
                {device.name}
              </h1>
              <RiskLevelPill level={riskLevel} />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground lg:flex-nowrap">
              <span className="font-mono text-xs tracking-wide whitespace-nowrap">
                {device.device_id}
              </span>
              <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap">
                <HugeiconsIcon
                  icon={Location01Icon}
                  strokeWidth={2}
                  className="size-3.5 shrink-0"
                />
                <span className="truncate">{device.location_name || "—"}</span>
              </span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  strokeWidth={2}
                  className="size-3.5 shrink-0"
                />
                Terakhir diperbarui: {formatRelativeTime(lastSeenAt)}
              </span>
            </div>
          </div>
        </div>

        {isAdmin ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Aksi Device"
                />
              }
            >
              <HugeiconsIcon
                icon={MoreHorizontalCircle01Icon}
                strokeWidth={2}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                Ubah
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleting(true)}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <EditDeviceDialog
        device={device}
        open={editing}
        onOpenChange={setEditing}
      />
      <DeleteDeviceDialog
        device={device}
        open={deleting}
        onOpenChange={setDeleting}
        onDeleted={() => {
          void navigate({ to: "/nodes" })
        }}
      />
    </div>
  )
}
