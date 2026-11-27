import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useIssueCommand } from "@/features/commands/mutations"
import type { IssueCommandInput } from "@/features/commands/types"
import { ApiError } from "@/lib/api/types"

export function RefreshTelemetryButton({
  deviceId,
  triggerVariant = "outline",
  triggerSize = "sm",
}: {
  deviceId: string
  triggerVariant?: React.ComponentProps<typeof Button>["variant"]
  triggerSize?: React.ComponentProps<typeof Button>["size"]
}) {
  const [open, setOpen] = useState(false)
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID()
  )
  const issueCommand = useIssueCommand()

  const handleOpen = () => {
    setIdempotencyKey(crypto.randomUUID())
    issueCommand.reset()
    setOpen(true)
  }

  const handleSubmit = async () => {
    const input: IssueCommandInput = { action: "GET_ALL_TELEMETRY" }

    try {
      await issueCommand.mutateAsync({ deviceId, input, idempotencyKey })
      toast.success("Permintaan telemetri terbaru terkirim.")
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Gagal mengirim permintaan telemetri."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size={triggerSize} variant={triggerVariant} onClick={handleOpen}>
        <HugeiconsIcon
          icon={RefreshIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Minta Telemetri
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Minta Telemetri Terbaru</DialogTitle>
          <DialogDescription>
            Perangkat akan segera mempublikasikan seluruh telemetri terbaru
            (lingkungan, api/asap, dan perangkat).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={issueCommand.isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={issueCommand.isPending}
          >
            {issueCommand.isPending ? "Mengirim..." : "Kirim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
