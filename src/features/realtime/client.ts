import { API_BASE_URL } from "@/lib/api/config"
import { ApiError } from "@/lib/api/types"

import { createRealtimeTicket } from "./mutations"
import type { RealtimeEventType, RealtimeMessage } from "./types"

export type RealtimeStatus =
  "idle" | "connecting" | "connected" | "reconnecting" | "error"

const REALTIME_EVENT_TYPES: ReadonlySet<string> = new Set<RealtimeEventType>([
  "connected",
  "telemetry.environment",
  "telemetry.fire",
  "event.created",
  "event.updated",
  "event.resolved",
  "risk.updated",
  "device.status",
  "command.issued",
  "command.ack",
  "command.timeout",
])

const MAX_RECONNECT_DELAY_MS = 30_000
const RECONNECT_JITTER_MS = 250

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function parseRealtimeMessage(raw: unknown): RealtimeMessage | null {
  if (typeof raw !== "string") {
    return null
  }

  try {
    const value: unknown = JSON.parse(raw)

    if (!isRecord(value) || typeof value.type !== "string") {
      return null
    }

    if (!REALTIME_EVENT_TYPES.has(value.type)) {
      return null
    }

    if (value.type === "connected") {
      return { type: "connected" }
    }

    if (typeof value.device_id !== "string" || !isRecord(value.data)) {
      return null
    }

    return value as RealtimeMessage
  } catch {
    return null
  }
}

export function buildRealtimeSocketUrl(
  apiBaseUrl: string,
  ticket: string,
  deviceId: string | undefined,
  origin: string
): string {
  const baseUrl = new URL(apiBaseUrl, origin)
  const socketUrl = new URL(baseUrl.toString())

  socketUrl.protocol = baseUrl.protocol === "https:" ? "wss:" : "ws:"
  socketUrl.pathname = `${baseUrl.pathname.replace(/\/+$/, "")}/ws`
  socketUrl.search = ""
  socketUrl.hash = ""
  socketUrl.searchParams.set("ticket", ticket)

  const normalizedDeviceId = deviceId?.trim()

  if (normalizedDeviceId) {
    socketUrl.searchParams.set("device_id", normalizedDeviceId)
  }

  return socketUrl.toString()
}

export function getRealtimeSocketUrl(
  ticket: string,
  deviceId?: string
): string {
  return buildRealtimeSocketUrl(
    API_BASE_URL,
    ticket,
    deviceId,
    window.location.href
  )
}

export interface RealtimeConnectedEvent {
  reconnected: boolean
}

export interface RealtimeClientHandlers {
  onMessage: (message: RealtimeMessage) => void
  onStatusChange: (status: RealtimeStatus) => void
  onError: (message: string | null) => void
  onConnected: (event: RealtimeConnectedEvent) => void
}

export class RealtimeClient {
  private readonly handlers: RealtimeClientHandlers
  private socket: WebSocket | null = null
  private reconnectTimer: number | null = null
  private generation = 0
  private reconnectAttempt = 0
  private deviceId: string | undefined
  private manualDisconnect = true
  private hasConnected = false

  constructor(handlers: RealtimeClientHandlers) {
    this.handlers = handlers
  }

  start(): void {
    this.hasConnected = false
    this.manualDisconnect = false
    this.openConnection("connecting")
  }

  stop(): void {
    this.manualDisconnect = true
    this.generation += 1
    this.clearReconnectTimer()
    this.closeSocket()
  }

  connect(deviceId?: string): void {
    this.deviceId = deviceId?.trim() || undefined
    this.manualDisconnect = false
    this.reconnectAttempt = 0
    this.openConnection("connecting")
  }

  disconnect(): void {
    this.manualDisconnect = true
    this.generation += 1
    this.clearReconnectTimer()
    this.closeSocket()
    this.handlers.onError(null)
    this.handlers.onStatusChange("idle")
  }

  private openConnection(status: RealtimeStatus): void {
    this.generation += 1
    const generation = this.generation

    this.clearReconnectTimer()
    this.closeSocket()
    this.handlers.onError(null)
    this.handlers.onStatusChange(status)
    void this.requestAndOpen(generation)
  }

  private async requestAndOpen(generation: number): Promise<void> {
    try {
      const ticket = await createRealtimeTicket()

      if (generation !== this.generation || this.manualDisconnect) {
        return
      }

      const socket = new WebSocket(
        getRealtimeSocketUrl(ticket.ticket, this.deviceId)
      )

      this.socket = socket
      socket.onmessage = (event) => this.handleMessage(event.data, generation)
      socket.onclose = () => this.handleClose(generation)
    } catch (error) {
      if (generation !== this.generation || this.manualDisconnect) {
        return
      }

      this.handleTicketError(error)
    }
  }

  private handleMessage(raw: unknown, generation: number): void {
    if (generation !== this.generation) {
      return
    }

    const message = parseRealtimeMessage(raw)

    if (!message) {
      return
    }

    if (message.type === "connected") {
      const reconnected = this.hasConnected

      this.hasConnected = true
      this.reconnectAttempt = 0
      this.handlers.onError(null)
      this.handlers.onStatusChange("connected")
      this.handlers.onConnected({ reconnected })
    }

    this.handlers.onMessage(message)
  }

  private handleClose(generation: number): void {
    if (generation !== this.generation) {
      return
    }

    this.socket = null

    if (this.manualDisconnect) {
      return
    }

    this.scheduleReconnect()
  }

  private handleTicketError(error: unknown): void {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      this.manualDisconnect = true
      this.handlers.onError("Sesi masuk tidak valid. Silakan masuk ulang.")
      this.handlers.onStatusChange("error")
      return
    }

    if (error instanceof ApiError && error.code === "internal_error") {
      this.handlers.onError("Server gagal membuat tiket waktu nyata.")
    } else {
      this.handlers.onError(
        "Tidak dapat membuat tiket waktu nyata. Mencoba lagi..."
      )
    }

    this.scheduleReconnect()
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      1000 * 2 ** this.reconnectAttempt,
      MAX_RECONNECT_DELAY_MS
    )

    this.reconnectAttempt += 1
    this.handlers.onStatusChange("reconnecting")

    this.reconnectTimer = window.setTimeout(
      () => {
        this.reconnectTimer = null

        if (this.manualDisconnect) {
          return
        }

        this.openConnection("reconnecting")
      },
      delay + Math.random() * RECONNECT_JITTER_MS
    )
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer === null) {
      return
    }

    window.clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private closeSocket(): void {
    if (!this.socket) {
      return
    }

    this.socket.onmessage = null
    this.socket.onclose = null
    this.socket.close()
    this.socket = null
  }
}
