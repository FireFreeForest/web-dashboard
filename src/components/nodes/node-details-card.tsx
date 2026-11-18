import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  BatteryIcon,
  BoltIcon,
  CpuIcon,
  RadioTowerIcon,
  SignalFull01Icon,
  Timer01Icon,
} from "@hugeicons/core-free-icons"

import { DeviceStatusPill } from "@/components/devices/device-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import type { Device, DeviceStatus } from "@/features/devices/types"
import { cn, formatUptime, formatVoltage } from "@/lib/utils"

import { nodeHardwarePlaceholder } from "./node-detail-placeholders"

const signalBarHeights = ["h-1.5", "h-2", "h-2.5", "h-3", "h-3.5"]

function getSignalBars(rssiDbm: number): number {
  if (rssiDbm >= -50) return 5
  if (rssiDbm >= -60) return 4
  if (rssiDbm >= -70) return 3
  if (rssiDbm >= -80) return 2
  return 1
}

function SignalBars({ rssiDbm }: { rssiDbm: number }) {
  const filled = getSignalBars(rssiDbm)

  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {signalBarHeights.map((height, index) => (
        <span
          key={height}
          className={cn(
            "w-1 rounded-full",
            height,
            index < filled ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </span>
  )
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: IconSvgElement
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
        {label}
      </span>
      <span className="flex items-center gap-2 font-medium">{children}</span>
    </div>
  )
}

export function NodeDetailsCard({
  device,
  status,
  uptimeSeconds,
}: {
  device: Device
  status: DeviceStatus
  uptimeSeconds: number | null
}) {
  const hardware = nodeHardwarePlaceholder

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Device</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DetailRow icon={RadioTowerIcon} label="Status">
          <DeviceStatusPill status={status} />
        </DetailRow>
        <Separator />
        <DetailRow icon={CpuIcon} label="Versi Firmware">
          <span className="font-mono text-xs">
            {device.firmware_version || "-"}
          </span>
        </DetailRow>
        <Separator />
        <DetailRow icon={SignalFull01Icon} label="Sinyal (RSSI)">
          <SignalBars rssiDbm={hardware.rssiDbm} />
          <span className="tabular-nums">{hardware.rssiDbm} dBm</span>
        </DetailRow>
        <Separator />
        <DetailRow icon={BatteryIcon} label="Baterai">
          <Progress value={hardware.batteryPct} className="w-16" />
          <span className="tabular-nums">{hardware.batteryPct}%</span>
        </DetailRow>
        <Separator />
        <DetailRow icon={BoltIcon} label="Tegangan">
          <span className="tabular-nums">
            {formatVoltage(hardware.voltageV)}
          </span>
        </DetailRow>
        <Separator />
        <DetailRow icon={Timer01Icon} label="Waktu Aktif">
          <span>{formatUptime(uptimeSeconds)}</span>
        </DetailRow>
      </CardContent>
    </Card>
  )
}
