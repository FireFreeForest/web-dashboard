import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useMe } from "@/features/auth/queries"
import {
  useAcknowledgeEvent,
  useResolveEvent,
} from "@/features/events/mutations"
import type { EventDetail } from "@/features/events/types"
import { ApiError } from "@/lib/api/types"

export function EventActions({
  event,
  onRefresh,
}: {
  event: EventDetail
  onRefresh: () => void
}) {
  const { data: user } = useMe()
  const acknowledge = useAcknowledgeEvent()
  const resolve = useResolveEvent()

  const canAcknowledge =
    (user?.role === "admin" || user?.role === "petugas") &&
    event.status === "active"
  const canResolve = user?.role === "petugas" && event.status !== "resolved"

  const handleInvalidState = () => {
    toast.error("Status event sudah berubah. Memuat ulang...")
    onRefresh()
  }

  const handleAcknowledge = async () => {
    try {
      await acknowledge.mutateAsync(event.id)
      toast.success("Event dikonfirmasi.")
    } catch (error) {
      if (error instanceof ApiError && error.code === "invalid_state") {
        handleInvalidState()
        return
      }
      toast.error(
        error instanceof ApiError ? error.message : "Terjadi kesalahan."
      )
    }
  }

  const handleResolve = async () => {
    try {
      await resolve.mutateAsync(event.id)
      toast.success("Event diselesaikan.")
    } catch (error) {
      if (error instanceof ApiError && error.code === "invalid_state") {
        handleInvalidState()
        return
      }
      toast.error(
        error instanceof ApiError ? error.message : "Terjadi kesalahan."
      )
    }
  }

  if (!canAcknowledge && !canResolve) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canAcknowledge ? (
        <Button onClick={handleAcknowledge} disabled={acknowledge.isPending}>
          {acknowledge.isPending ? "Memproses..." : "Konfirmasi"}
        </Button>
      ) : null}
      {canResolve ? (
        <Button
          variant="outline"
          onClick={handleResolve}
          disabled={resolve.isPending}
        >
          {resolve.isPending ? "Memproses..." : "Selesaikan"}
        </Button>
      ) : null}
    </div>
  )
}
