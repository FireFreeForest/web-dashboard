import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import {
  getNotificationPermission,
  getPushErrorMessage,
  isPushSupported,
  isWebPushAvailable,
  requestPushPermission,
} from "@/features/push/fcm"
import { removePushToken, syncPushToken } from "@/features/push/registration"
import {
  getStoredPushToken,
  isPushDisabled,
  setPushDisabled,
} from "@/features/push/token-storage"
import { ApiError } from "@/lib/api/types"

type BusyState = "idle" | "enabling" | "disabling"

function getApiErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "invalid_request":
      return "Token FCM ditolak server."
    case "unauthorized":
    case "invalid_token":
      return "Sesi berakhir. Silakan masuk ulang."
    case "internal_error":
      return "Server gagal menyimpan token."
    case "network_error":
      return "Tidak dapat terhubung ke server."
    default:
      return error.message
  }
}

function getActivationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return getApiErrorMessage(error)
  }

  const detail = getPushErrorMessage(error)

  if (/push service error/i.test(detail)) {
    return 'Browser tidak dapat menjangkau layanan push. Di Brave, aktifkan "Use Google services for push messaging" di brave://settings/privacy, atau gunakan Google Chrome/Firefox.'
  }

  if (/permission/i.test(detail)) {
    return "Izin notifikasi tidak tersedia untuk situs ini. Periksa pengaturan izin browser."
  }

  if (/403|installations|credential/i.test(detail)) {
    return "Konfigurasi Firebase ditolak. Periksa batasan API key dan pastikan Firebase Installations API aktif."
  }

  return `Gagal mengaktifkan notifikasi: ${detail}`
}

export function PushNotificationSettings() {
  const [supported, setSupported] = React.useState<boolean | null>(() =>
    isPushSupported() ? null : false
  )
  const [permission, setPermission] =
    React.useState<NotificationPermission | null>(getNotificationPermission)
  const [token, setToken] = React.useState(
    () => getStoredPushToken()?.token ?? ""
  )
  const [disabled, setDisabled] = React.useState(isPushDisabled)
  const [busy, setBusy] = React.useState<BusyState>("idle")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    if (!isPushSupported()) {
      return
    }

    void isWebPushAvailable().then((available) => {
      if (!cancelled) {
        setSupported(available)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const isPending = busy !== "idle"
  const isDenied = permission === "denied"

  const handleEnable = async () => {
    setErrorMessage(null)
    setBusy("enabling")

    try {
      const nextPermission = await requestPushPermission()
      setPermission(nextPermission)

      if (nextPermission !== "granted") {
        if (nextPermission === "denied") {
          setErrorMessage(
            "Izin notifikasi diblokir. Aktifkan kembali melalui pengaturan situs di browser Anda."
          )
        }
        return
      }

      setPushDisabled(false)

      const nextToken = await syncPushToken({ force: true })

      if (!nextToken) {
        setPushDisabled(disabled)
        setErrorMessage(
          "Token FCM tidak dapat dibuat. Pastikan konfigurasi Firebase sudah benar."
        )
        return
      }

      setToken(nextToken)
      setDisabled(false)
      toast.success("Notifikasi push berhasil diaktifkan.")
    } catch (error) {
      setPushDisabled(disabled)
      console.error("Gagal mengaktifkan notifikasi push:", error)
      setErrorMessage(getActivationErrorMessage(error))
    } finally {
      setBusy("idle")
    }
  }

  const handleDisable = async () => {
    setErrorMessage(null)
    setBusy("disabling")

    try {
      await removePushToken()
      setToken("")
      setDisabled(true)
      toast.success("Notifikasi push dinonaktifkan.")
    } catch (error) {
      console.error("Gagal menonaktifkan notifikasi push:", error)
      setErrorMessage(getActivationErrorMessage(error))
    } finally {
      setBusy("idle")
    }
  }

  return (
    <section className="space-y-3">
      {supported === false ? (
        <p className="text-sm text-muted-foreground">
          Browser ini tidak mendukung notifikasi push web. Gunakan browser
          terbaru berbasis Chromium atau Firefox melalui HTTPS.
        </p>
      ) : (
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="push-notification-enabled">
              Notifikasi Push
            </FieldLabel>
            <FieldDescription>
              Terima peringatan Event langsung di browser ini. Hanya dikirim ke
              User aktif dengan peran admin atau petugas.
            </FieldDescription>
            {isDenied ? (
              <FieldError>
                Izin notifikasi diblokir. Buka pengaturan situs di browser untuk
                mengizinkan notifikasi, lalu muat ulang halaman ini.
              </FieldError>
            ) : null}
            {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
          </FieldContent>
          <div className="flex items-center gap-2">
            {isPending ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                strokeWidth={2}
                className="size-4 animate-spin text-muted-foreground"
              />
            ) : null}
            <Switch
              id="push-notification-enabled"
              checked={Boolean(token) && !disabled}
              disabled={
                isPending ||
                supported === null ||
                (isDenied && (disabled || !token))
              }
              onCheckedChange={(checked) => {
                void (checked ? handleEnable() : handleDisable())
              }}
            />
          </div>
        </Field>
      )}
    </section>
  )
}
