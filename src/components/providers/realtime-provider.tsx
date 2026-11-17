import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { applyRealtimeMessage } from "@/features/realtime/cache"
import { RealtimeClient, type RealtimeStatus } from "@/features/realtime/client"
import type { RealtimeMessage } from "@/features/realtime/types"

type RealtimeProviderState = {
  status: RealtimeStatus
  lastMessage: RealtimeMessage | null
  lastMessageAt: Date | null
  errorMessage: string | null
  deviceId: string | null
  connect: () => void
  disconnect: () => void
  reconnect: (deviceId?: string) => void
}

type RealtimeProviderProps = {
  children: React.ReactNode
}

const RealtimeProviderContext = React.createContext<
  RealtimeProviderState | undefined
>(undefined)

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const queryClient = useQueryClient()
  const [status, setStatus] = React.useState<RealtimeStatus>("idle")
  const [lastMessage, setLastMessage] = React.useState<RealtimeMessage | null>(
    null
  )
  const [lastMessageAt, setLastMessageAt] = React.useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [deviceId, setDeviceId] = React.useState<string | null>(null)

  const [client] = React.useState(
    () =>
      new RealtimeClient({
        onMessage: (message) => {
          setLastMessage(message)
          setLastMessageAt(new Date())
          applyRealtimeMessage(queryClient, message)
        },
        onStatusChange: setStatus,
        onError: setErrorMessage,
        onConnected: ({ reconnected }) => {
          if (reconnected) {
            void queryClient.invalidateQueries()
          }
        },
      })
  )

  React.useEffect(() => {
    client.start()

    return () => client.stop()
  }, [client])

  const connect = React.useCallback(() => {
    client.connect(deviceId ?? undefined)
  }, [client, deviceId])

  const disconnect = React.useCallback(() => {
    client.disconnect()
  }, [client])

  const reconnect = React.useCallback(
    (nextDeviceId?: string) => {
      const normalizedDeviceId = nextDeviceId?.trim() || null

      setDeviceId(normalizedDeviceId)
      client.connect(normalizedDeviceId ?? undefined)
    },
    [client]
  )

  const value = React.useMemo(
    () => ({
      status,
      lastMessage,
      lastMessageAt,
      errorMessage,
      deviceId,
      connect,
      disconnect,
      reconnect,
    }),
    [
      status,
      lastMessage,
      lastMessageAt,
      errorMessage,
      deviceId,
      connect,
      disconnect,
      reconnect,
    ]
  )

  return (
    <RealtimeProviderContext.Provider value={value}>
      {children}
    </RealtimeProviderContext.Provider>
  )
}

export function useRealtime() {
  const context = React.useContext(RealtimeProviderContext)

  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }

  return context
}
