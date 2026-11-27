import { HugeiconsIcon } from "@hugeicons/react"
import { AiChat01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const SUGGESTIONS = [
  "Perangkat mana saja yang sedang offline?",
  "Event aktif dengan severity critical apa saja?",
  "Perangkat mana yang berisiko BAHAYA atau DARURAT?",
  "Ringkas kondisi dashboard saat ini.",
  "Event DEVICE_OFFLINE atau LOW_BATTERY terbaru apa saja?",
  "Command pompa yang gagal atau timeout hari ini?",
]

export function AssistantEmpty() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={AiChat01Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Assistant Fire Free Forest</EmptyTitle>
          <EmptyDescription>
            Tanyakan kondisi perangkat, telemetri, event, atau riwayat command.
            Assistant hanya membaca data dan tidak menjalankan aksi tulis.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

export function AssistantSuggestions({
  onPick,
}: {
  onPick: (prompt: string) => void
}) {
  return (
    <div className="flex scroll-fade-x scrollbar-none gap-2 overflow-x-auto overscroll-x-contain">
      {SUGGESTIONS.map((suggestion) => (
        <Button
          key={suggestion}
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => onPick(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
