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
import type { DeviceTelemetry } from "@/features/telemetry/types"
import { cn, formatUptime, formatVoltage } from "@/lib/utils"

const LOW_BATTERY_PERCENT = 20

const signalBarHeights = ["h-1.5", "h-2", "h-2.5", "h-3", "h-3.5"]

type Tone = "good" | "warning" | "danger"

const TONE_CLASS: Record<Tone, { bar: string; text: string }> = {
  good: {
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    bar: "bg-destructive",
    text: "text-destructive",
  },
}

function getSignalBars(rssiDbm: number): number {
  if (rssiDbm >= -50) return 5
  if (rssiDbm >= -60) return 4
  if (rssiDbm >= -70) return 3
  if (rssiDbm >= -80) return 2
  return 1
}

function signalTone(rssiDbm: number): Tone {
  if (rssiDbm >= -60) return "good"
  if (rssiDbm >= -80) return "warning"
  return "danger"
}

function batteryTone(percentage: number): Tone {
  if (percentage >= 50) return "good"
  if (percentage >= LOW_BATTERY_PERCENT) return "warning"
  return "danger"
}

function SignalBars({ rssiDbm, tone }: { rssiDbm: number; tone: Tone }) {
  const filled = getSignalBars(rssiDbm)

  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {signalBarHeights.map((height, index) => (
        <span
          key={height}
          className={cn(
            "w-1 rounded-full",
            height,
            index < filled ? TONE_CLASS[tone].bar : "bg-muted"
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
  deviceTelemetry,
}: {
  device: Device
  status: DeviceStatus
  uptimeSeconds: number | null
  deviceTelemetry: DeviceTelemetry | null
}) {
  const firmwareVersion =
    deviceTelemetry?.firmware_version || device.firmware_version || "-"
  const wifiRssi = deviceTelemetry?.wifi_rssi ?? null
  const batteryPct = deviceTelemetry?.battery_percentage ?? null
  const batteryVoltage = deviceTelemetry?.battery_voltage ?? null
  const signalToneValue = wifiRssi !== null ? signalTone(wifiRssi) : null
  const batteryToneValue =
    batteryPct !== null ? batteryTone(batteryPct) : null

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
          <span className="font-mono text-xs">{firmwareVersion}</span>
        </DetailRow>
        <Separator />
        <DetailRow icon={SignalFull01Icon} label="Sinyal (RSSI)">
          {wifiRssi !== null && signalToneValue ? (
            <>
              <SignalBars rssiDbm={wifiRssi} tone={signalToneValue} />
              <span
                className={cn(
                  "tabular-nums",
                  TONE_CLASS[signalToneValue].text
                )}
              >
                {wifiRssi} dBm
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </DetailRow>
        <Separator />
        <DetailRow icon={BatteryIcon} label="Baterai">
          {batteryPct !== null && batteryToneValue ? (
            <>
              <Progress
                value={batteryPct}
                className="w-16"
                indicatorClassName={TONE_CLASS[batteryToneValue].bar}
              />
              <span
                className={cn(
                  "tabular-nums",
                  TONE_CLASS[batteryToneValue].text
                )}
              >
                {batteryPct}%
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </DetailRow>
        <Separator />
        <DetailRow icon={BoltIcon} label="Tegangan">
          <span className="tabular-nums">{formatVoltage(batteryVoltage)}</span>
        </DetailRow>
        <Separator />
        <DetailRow icon={Timer01Icon} label="Waktu Aktif">
          <span>{status === "online" ? formatUptime(uptimeSeconds) : "-"}</span>
        </DetailRow>
      </CardContent>
    </Card>
  )
}
