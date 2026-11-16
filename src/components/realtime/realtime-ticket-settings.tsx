import { useEffect, useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Ticket01Icon,
  Time01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useCreateRealtimeTicket } from "@/features/realtime/mutations"
import type { RealtimeTicket } from "@/features/realtime/types"
import { ApiError } from "@/lib/api/types"

function getRealtimeTicketErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "unauthorized":
    case "invalid_token":
      return "Sesi login tidak valid. Silakan login ulang."
    case "network_error":
      return "Tidak dapat terhubung ke server."
    case "internal_error":
      return "Server gagal membuat tiket realtime."
    default:
      return error.message
  }
}

export function RealtimeTicketSettings() {
  const createTicket = useCreateRealtimeTicket()
  const [ticket, setTicket] = useState<RealtimeTicket | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isExpired = ticket !== null && secondsLeft === 0

  useEffect(() => {
    if (expiresAt === null) {
      return
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [expiresAt])

  const handleCreate = async () => {
    setErrorMessage(null)

    try {
      const result = await createTicket.mutateAsync()
      setTicket(result)
      setExpiresAt(Date.now() + result.expires_in * 1000)
      setSecondsLeft(result.expires_in)
      toast.success("Tiket realtime berhasil dibuat.")
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(getRealtimeTicketErrorMessage(error))
        return
      }
      setErrorMessage("Terjadi kesalahan tidak terduga.")
    }
  }

  const handleCopy = async () => {
    if (!ticket) {
      return
    }

    try {
      await navigator.clipboard.writeText(ticket.ticket)
      toast.success("Tiket realtime berhasil disalin.")
    } catch {
      toast.error("Gagal menyalin tiket. Salin manual dari kolom tiket.")
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">Ticket inspector</h3>
        <p className="text-sm text-muted-foreground">
          Utilitas manual untuk memeriksa tiket. Koneksi realtime utama membuat
          tiket sendiri secara otomatis.
        </p>
      </div>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="realtime-ticket">Tiket WebSocket</FieldLabel>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="realtime-ticket"
              value={ticket?.ticket ?? ""}
              placeholder="Belum ada tiket"
              readOnly
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 font-mono text-xs"
              spellCheck={false}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              disabled={!ticket || isExpired}
              className="sm:shrink-0"
            >
              <HugeiconsIcon
                icon={Copy01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Salin
            </Button>
          </div>
          <FieldDescription>
            Tiket berasal dari endpoint realtime, bukan access token login.
            Jangan bagikan tiket ini kepada pengguna lain.
          </FieldDescription>
        </Field>
        {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {ticket ? (
            <Badge variant={isExpired ? "outline" : "secondary"}>
              <HugeiconsIcon
                icon={Time01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {isExpired ? "Kedaluwarsa" : `Berlaku ${secondsLeft} detik`}
            </Badge>
          ) : (
            <p className="text-xs text-muted-foreground">
              Belum ada tiket aktif.
            </p>
          )}
          <Button
            type="button"
            onClick={handleCreate}
            disabled={createTicket.isPending}
          >
            <HugeiconsIcon
              icon={Ticket01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {createTicket.isPending
              ? "Membuat tiket..."
              : ticket
                ? "Buat tiket baru"
                : "Buat tiket"}
          </Button>
        </div>
      </FieldGroup>
    </section>
  )
}
