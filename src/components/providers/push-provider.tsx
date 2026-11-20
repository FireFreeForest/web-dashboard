import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { eventKeys } from "@/features/events/queries"
import {
  isPushSupported,
  subscribeForegroundMessages,
} from "@/features/push/fcm"
import { syncPushToken } from "@/features/push/registration"
import { isPushDisabled } from "@/features/push/token-storage"

type PushProviderProps = {
  children: React.ReactNode
}

export function PushProvider({ children }: PushProviderProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!isPushSupported()) {
      return
    }

    const sync = (force = false) => {
      if (isPushDisabled() || Notification.permission !== "granted") {
        return
      }

      void syncPushToken({ force }).catch((error) => {
        console.error("Gagal menyinkronkan token notifikasi push:", error)
      })
    }

    sync(true)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sync()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleVisibilityChange)
    }
  }, [])

  React.useEffect(() => {
    return subscribeForegroundMessages((payload) => {
      const title = payload.notification?.title ?? "Notifikasi baru"
      const body = payload.notification?.body ?? ""

      toast(title, {
        description: body || undefined,
        action: {
          label: "Lihat",
          onClick: () => {
            void navigate({ to: "/events" })
          },
        },
      })

      void queryClient.invalidateQueries({ queryKey: eventKeys.all })
    })
  }, [navigate, queryClient])

  return <>{children}</>
}
