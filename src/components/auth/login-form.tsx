import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PineTreeIcon } from "@hugeicons/core-free-icons"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/features/auth/mutations"
import { ApiError } from "@/lib/api/types"
import { cn } from "@/lib/utils"

function getLoginErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Email atau kata sandi salah."
    case "account_inactive":
      return "Akun tidak aktif."
    case "rate_limited":
      return "Terlalu banyak percobaan masuk."
    case "network_error":
      return "Tidak dapat terhubung ke server."
    default:
      return error.message
  }
}

export function LoginForm({
  className,
  redirectTo,
  ...props
}: React.ComponentProps<"div"> & { redirectTo?: string }) {
  const navigate = useNavigate()
  const login = useLogin()
  const [retryUntil, setRetryUntil] = React.useState(0)
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (retryUntil <= Date.now()) {
      return
    }

    const interval = window.setInterval(() => {
      const current = Date.now()
      setNow(current)

      if (current >= retryUntil) {
        window.clearInterval(interval)
        setRetryUntil(0)
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [retryUntil])

  const retryLeft = Math.max(0, Math.ceil((retryUntil - now) / 1000))
  const isRateLimited = retryLeft > 0
  const isDisabled = login.isPending || isRateLimited

  const errorMessage = isRateLimited
    ? `Terlalu banyak percobaan. Coba lagi dalam ${retryLeft} detik.`
    : login.error
      ? getLoginErrorMessage(login.error)
      : null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isDisabled) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    try {
      await login.mutateAsync({ email, password })
      await navigate({ href: redirectTo ?? "/", replace: true })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "rate_limited" &&
        error.retryAfterSeconds
      ) {
        const until = Date.now() + error.retryAfterSeconds * 1000
        setRetryUntil(until)
        setNow(Date.now())
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon icon={PineTreeIcon} strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold">Fire Free Forest</h1>
            <FieldDescription>
              Masuk ke dasbor pemantauan hutan.
            </FieldDescription>
          </div>
          <Field data-invalid={Boolean(errorMessage)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Masukkan email Anda"
              aria-invalid={Boolean(errorMessage)}
              disabled={login.isPending}
              required
              onChange={() => login.reset()}
            />
          </Field>
          <Field data-invalid={Boolean(errorMessage)}>
            <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan kata sandi Anda"
              aria-invalid={Boolean(errorMessage)}
              disabled={login.isPending}
              required
              onChange={() => login.reset()}
            />
            <FieldError>{errorMessage}</FieldError>
          </Field>
          <Field>
            <Button
              type="submit"
              disabled={isDisabled}
              aria-busy={login.isPending}
            >
              {login.isPending ? "Sedang masuk..." : "Masuk"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
