import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import type { UIMessage } from "ai"

import { Markdown } from "@/components/assistant/markdown"
import { StepTrace } from "@/components/assistant/assistant-tool-trace"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Message, MessageContent, MessageFooter } from "@/components/ui/message"
import { Trace } from "@/components/ui/trace"

type AnyPart = Parameters<typeof StepTrace>[0]["part"]

function textOf(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n\n")
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? "Tersalin" : "Salin jawaban"}
      onClick={() => void handleCopy()}
    >
      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} strokeWidth={2} />
    </Button>
  )
}

export function AssistantMessage({
  message,
  streaming,
}: {
  message: UIMessage
  streaming: boolean
}) {
  if (message.role === "user") {
    const text = textOf(message)

    return (
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="muted">
            <BubbleContent className="text-base leading-7">
              {text}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    )
  }

  const text = textOf(message)
  const hasSteps = message.parts.some(
    (part) => part.type === "reasoning" || part.type.startsWith("tool-")
  )

  return (
    <Message>
      <MessageContent className="gap-2 text-base">
        {hasSteps ? (
          <Trace>
            {message.parts.map((part, index) => (
              <StepTrace
                key={`${part.type}-${index}`}
                part={part as unknown as AnyPart}
              />
            ))}
          </Trace>
        ) : null}

        {text ? <Markdown>{text}</Markdown> : null}

        {!text && streaming && !hasSteps ? (
          <span className="text-sm text-muted-foreground">
            Assistant sedang menyiapkan jawaban...
          </span>
        ) : null}

        {text && !streaming ? (
          <MessageFooter className="px-0">
            <CopyButton text={text} />
          </MessageFooter>
        ) : null}
      </MessageContent>
    </Message>
  )
}
