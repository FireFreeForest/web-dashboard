import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRegisterPushToken } from "@/features/push/mutations"
import {
  registerPushTokenSchema,
  type RegisterPushTokenFormValues,
} from "@/features/push/schema"
import {
  saveStoredPushToken,
  getStoredPushToken,
} from "@/features/push/token-storage"
import {
  DEFAULT_PUSH_PLATFORM,
  PUSH_PLATFORM_LABELS,
  PUSH_PLATFORMS,
  type PushPlatform,
} from "@/features/push/types"
import { ApiError } from "@/lib/api/types"

type FieldErrors = Partial<Record<keyof RegisterPushTokenFormValues, string>>

function getRegisterPushTokenErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "invalid_request":
      return "Token FCM tidak valid."
    case "network_error":
      return "Tidak dapat terhubung ke server."
    default:
      return error.message
  }
}

function getInitialPlatform(): PushPlatform {
  const stored = getStoredPushToken()?.platform

  return (
    PUSH_PLATFORMS.find((platform) => platform === stored) ??
    DEFAULT_PUSH_PLATFORM
  )
}

export function PushNotificationSettings() {
  const registerPushToken = useRegisterPushToken()
  const [token, setToken] = useState(() => getStoredPushToken()?.token ?? "")
  const [platform, setPlatform] = useState<PushPlatform>(getInitialPlatform)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const parsed = registerPushTokenSchema.safeParse({ token, platform })

    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterPushTokenFormValues
        nextErrors[key] ??= issue.message
      }
      setErrors(nextErrors)
      return
    }

    setErrors({})

    try {
      await registerPushToken.mutateAsync(parsed.data)
      saveStoredPushToken(parsed.data)
      toast.success("Token notifikasi berhasil didaftarkan.")
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "invalid_request") {
          setErrors({ token: getRegisterPushTokenErrorMessage(error) })
        } else {
          setErrorMessage(getRegisterPushTokenErrorMessage(error))
        }
        return
      }
      setErrorMessage("Terjadi kesalahan tidak terduga.")
    }
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Push notifications</h3>
        <p className="text-sm text-muted-foreground">
          Daftarkan token Firebase Cloud Messaging (FCM) perangkat ini agar
          menerima notifikasi event.
        </p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup className="gap-4">
          <Field data-invalid={Boolean(errors.token)}>
            <FieldLabel htmlFor="push-token">Token FCM</FieldLabel>
            <Input
              id="push-token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Tempel token FCM dari Firebase SDK"
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-xs"
              aria-invalid={Boolean(errors.token)}
              disabled={registerPushToken.isPending}
            />
            <FieldDescription>
              Token diperoleh dari Firebase SDK perangkat, bukan access token
              login. Token yang sama akan diperbarui, bukan diduplikasi.
            </FieldDescription>
            <FieldError>{errors.token}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.platform)}>
            <FieldLabel htmlFor="push-platform">Platform</FieldLabel>
            <Select
              value={platform}
              onValueChange={(value) => setPlatform(value as PushPlatform)}
              disabled={registerPushToken.isPending}
            >
              <SelectTrigger id="push-platform" className="w-full">
                <SelectValue>
                  {(value) =>
                    PUSH_PLATFORM_LABELS[value as PushPlatform] ??
                    PUSH_PLATFORM_LABELS[DEFAULT_PUSH_PLATFORM]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PUSH_PLATFORMS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {PUSH_PLATFORM_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.platform}</FieldError>
          </Field>
          {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Push event hanya dikirim ke user aktif dengan role admin atau
              petugas.
            </p>
            <Button type="submit" disabled={registerPushToken.isPending}>
              {registerPushToken.isPending
                ? "Mendaftarkan..."
                : "Daftarkan Token"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  )
}
