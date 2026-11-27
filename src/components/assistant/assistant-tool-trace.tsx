import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Brain01Icon, Wrench01Icon } from "@hugeicons/core-free-icons"

import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block"
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace"

type AnyPart = {
  type: string
  text?: string
  state?: string
  input?: unknown
  output?: unknown
  errorText?: string
  toolCallId?: string
}

const TOOL_LABELS: Record<string, string> = {
  fff_list_devices: "Membaca daftar perangkat",
  fff_get_device: "Membaca detail perangkat",
  fff_get_device_status: "Membaca status perangkat",
  fff_list_environment_telemetry: "Membaca telemetri lingkungan",
  fff_list_fire_telemetry: "Membaca telemetri kebakaran",
  fff_get_latest_telemetry: "Membaca telemetri terbaru",
  fff_aggregate_environment_telemetry: "Meringkas telemetri lingkungan",
  fff_aggregate_fire_telemetry: "Meringkas telemetri kebakaran",
  fff_list_events: "Membaca daftar event",
  fff_get_event: "Membaca detail event",
  fff_list_event_timeline: "Membaca timeline event",
  fff_list_commands: "Membaca riwayat command",
  fff_get_command: "Membaca detail command",
  fff_get_dashboard_summary: "Membaca ringkasan dashboard",
  fff_dashboard_summary: "Membaca ringkasan dashboard",
  fff_reverse_geocode: "Mencari nama lokasi",
}

export function toolName(part: AnyPart): string {
  return part.type.replace(/^tool-/, "")
}

function toolLabel(part: AnyPart): string {
  const name = toolName(part)
  return TOOL_LABELS[name] ?? name.replaceAll("_", " ")
}

function formatPayload(value: unknown): string {
  if (typeof value === "string") {
    return value
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function ToolTrace({ part }: { part: AnyPart }) {
  const label = toolLabel(part)
  const state = part.state
  const isDone = state === "output-available"
  const isError = state === "output-error"
  const hasOutput = part.output !== undefined || isError
  const title = isError
    ? `Gagal: ${label}`
    : isDone
      ? label
      : `Menjalankan: ${label}`

  const line = (
    <TraceLine status={isError ? "error" : isDone ? undefined : "running"}>
      <TraceIcon>
        <HugeiconsIcon icon={Wrench01Icon} strokeWidth={2} />
      </TraceIcon>
      <TraceTitle>{title}</TraceTitle>
    </TraceLine>
  )

  if (!hasOutput) {
    return line
  }

  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <CodeBlock size="sm">
          <CodeBlockContent wrap className="max-h-64">
            {isError
              ? (part.errorText ?? "Tool gagal dijalankan.")
              : formatPayload(part.output)}
          </CodeBlockContent>
        </CodeBlock>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

export function ReasoningTrace({ part }: { part: AnyPart }) {
  const text = part.text ?? ""
  const running = part.state === "streaming"
  const [open, setOpen] = useState<boolean>()

  if (!text) {
    return null
  }

  return (
    <TraceCollapsible open={open ?? running} onOpenChange={setOpen}>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : undefined}>
          <TraceIcon>
            <HugeiconsIcon icon={Brain01Icon} strokeWidth={2} />
          </TraceIcon>
          <TraceTitle>{running ? "Berpikir" : "Selesai berpikir"}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="whitespace-pre-wrap">
        {text}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

export function StepTrace({ part }: { part: AnyPart }) {
  if (part.type === "reasoning") {
    return <ReasoningTrace part={part} />
  }

  if (part.type.startsWith("tool-")) {
    return <ToolTrace part={part} />
  }

  return null
}
