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
import { cn } from "@/lib/utils"
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
  "telemetry.environment": "Telemetri lingkungan",
  "telemetry.fire": "Telemetri api dan asap",
  "event.created": "Event baru",
  "event.updated": "Event diperbarui",
  "event.resolved": "Event selesai",
  "risk.updated": "Tingkat risiko diperbarui",
  "device.status": "Status device",
  "command.issued": "Command dibuat",
  "command.ack": "Command dikonfirmasi",
  "command.timeout": "Command timeout",
}

const TIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

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

  return TIME_FORMATTER.format(date)
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
    : "Belum ada pesan realtime."
  const lastMessageTime = getLastMessageTime(lastMessage, lastMessageAt)

  const handleApplyFilter = () => {
    reconnect(deviceFilter)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">WebSocket connection</h3>
        <p className="text-sm text-muted-foreground">
          Koneksi realtime terbuka otomatis setelah login. Tiket dibuat ulang
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
            Filter device
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
            Kosongkan untuk menerima semua device. Gunakan kode device, bukan
            UUID. Filter aktif: {deviceId ?? "semua device"}.
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
