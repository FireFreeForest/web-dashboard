import { useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp02Icon, StopIcon } from "@hugeicons/core-free-icons"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export function AssistantComposer({
  onSend,
  onStop,
  value,
  onValueChange,
  streaming = false,
  disabled = false,
}: {
  onSend: (text: string) => void
  onStop?: () => void
  value?: string
  onValueChange?: (value: string) => void
  streaming?: boolean
  disabled?: boolean
}) {
  const [internalText, setInternalText] = useState("")
  const text = value ?? internalText
  const formRef = useRef<HTMLFormElement>(null)
  const canSend = text.trim().length > 0 && !disabled && !streaming

  const setText = (next: string) => {
    onValueChange?.(next)

    if (value === undefined) {
      setInternalText(next)
    }
  }

  const submit = () => {
    const prompt = text.trim()

    if (!prompt || disabled || streaming) {
      return
    }

    onSend(prompt)
    setText("")
  }

  return (
    <form
      ref={formRef}
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <InputGroup>
        <InputGroupTextarea
          value={text}
          disabled={disabled}
          placeholder="Tanya tentang perangkat, telemetri, atau event..."
          aria-label="Pesan untuk assistant"
          className="p-3"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault()
              formRef.current?.requestSubmit()
            }
          }}
        />
        <InputGroupAddon align="block-end" className="pt-1">
          {streaming ? (
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="outline"
              className="ml-auto"
              aria-label="Hentikan jawaban"
              onClick={onStop}
            >
              <HugeiconsIcon icon={StopIcon} strokeWidth={2} />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="submit"
              size="icon-sm"
              variant="default"
              className="ml-auto"
              disabled={!canSend}
              aria-label="Kirim pesan"
            >
              <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2} />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
