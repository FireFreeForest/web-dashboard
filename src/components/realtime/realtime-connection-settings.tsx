import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  Alert01Icon,
  Loading03Icon,
  UnplugIcon,
  Wifi01Icon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons"

import { Badge, type badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRealtime } from "@/components/providers/realtime-provider"
import type { RealtimeStatus } from "@/features/realtime/client"
import type {
  RealtimeEventType,
  RealtimeMessage,
} from "@/features/realtime/types"
import { cn, formatTime } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

const STATUS_DETAILS: Record<
  RealtimeStatus,
  {
    label: string
    variant: BadgeVariant
    icon: typeof Wifi01Icon
    spinning?: boolean
  }
> = {
  idle: {
    label: "Terputus",
    variant: "outline",
    icon: WifiDisconnected01Icon,
  },
  connecting: {
    label: "Menghubungkan",
    variant: "secondary",
    icon: Loading03Icon,
    spinning: true,
  },
  connected: {
    label: "Terhubung",
    variant: "default",
    icon: Wifi01Icon,
  },
  reconnecting: {
    label: "Menyambung ulang",
    variant: "secondary",
    icon: Loading03Icon,
    spinning: true,
  },
  error: {
    label: "Gagal",
    variant: "destructive",
    icon: Alert01Icon,
  },
}

const MESSAGE_LABELS: Record<RealtimeEventType, string> = {
  connected: "Koneksi siap",
  "telemetry.environment": "Telemetri Lingkungan",
  "telemetry.fire": "Telemetri Api dan Asap",
  "event.created": "Event Baru",
  "event.updated": "Event Diperbarui",
  "event.resolved": "Event Selesai",
  "risk.updated": "Tingkat Risiko Diperbarui",
  "device.status": "Status Device",
  "command.issued": "Perintah Dibuat",
  "command.ack": "Perintah Dikonfirmasi",
  "command.timeout": "Perintah Waktu Habis",
}

function getLastMessageTime(
  message: RealtimeMessage | null,
  receivedAt: Date | null
): string | null {
  if (!message) {
    return null
  }

  const date = "ts" in message && message.ts ? new Date(message.ts) : receivedAt

  if (!date || Number.isNaN(date.getTime())) {
    return null
  }

  return formatTime(date)
}

export function RealtimeConnectionSettings() {
  const {
    status,
    lastMessage,
    lastMessageAt,
    errorMessage,
    deviceId,
    connect,
    disconnect,
    reconnect,
  } = useRealtime()
  const [deviceFilter, setDeviceFilter] = useState(deviceId ?? "")
  const statusDetails = STATUS_DETAILS[status]
  const isActive =
    status === "connected" ||
    status === "connecting" ||
    status === "reconnecting"
  const lastMessageLabel = lastMessage
    ? MESSAGE_LABELS[lastMessage.type]
    : "Belum ada pesan waktu nyata."
  const lastMessageTime = getLastMessageTime(lastMessage, lastMessageAt)

  const handleApplyFilter = () => {
    reconnect(deviceFilter)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">Koneksi WebSocket</h3>
        <p className="text-sm text-muted-foreground">
          Koneksi waktu nyata terbuka otomatis setelah login. Tiket dibuat ulang
          setiap kali koneksi terputus.
        </p>
      </div>
      <FieldGroup className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={statusDetails.variant}>
            <HugeiconsIcon
              icon={statusDetails.icon}
              strokeWidth={2}
              data-icon="inline-start"
              className={cn(statusDetails.spinning && "animate-spin")}
            />
            {statusDetails.label}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon
              icon={Activity01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            <span className="truncate">{lastMessageLabel}</span>
            {lastMessageTime ? (
              <span className="shrink-0 text-xs">{lastMessageTime}</span>
            ) : null}
          </div>
        </div>
        {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
        <Field>
          <FieldLabel htmlFor="realtime-device-filter">
            Filter Device
          </FieldLabel>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="realtime-device-filter"
              value={deviceFilter}
              onChange={(event) => setDeviceFilter(event.currentTarget.value)}
              placeholder="FFF-KTG-001"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyFilter}
              className="sm:shrink-0"
            >
              Terapkan filter
            </Button>
          </div>
          <FieldDescription>
            Kosongkan untuk menerima semua Device. Gunakan kode Device, bukan
            UUID. Filter aktif: {deviceId ?? "Semua Device"}.
          </FieldDescription>
        </Field>
        <div className="flex justify-end">
          {isActive ? (
            <Button type="button" variant="outline" onClick={disconnect}>
              <HugeiconsIcon
                icon={UnplugIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Putuskan
            </Button>
          ) : (
            <Button type="button" onClick={connect}>
              <HugeiconsIcon
                icon={Wifi01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Hubungkan
            </Button>
          )}
        </div>
      </FieldGroup>
    </section>
  )
}
