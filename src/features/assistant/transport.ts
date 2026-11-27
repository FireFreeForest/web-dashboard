import type { ChatTransport, UIMessage, UIMessageChunk } from "ai"

import { getAssistantAgent } from "./client"

type MastraChunk = {
  type: string
  payload?: Record<string, unknown>
}

function lastUserText(messages: UIMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]

    if (message.role !== "user") {
      continue
    }

    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim()
  }

  return ""
}

function textId(payload: Record<string, unknown> | undefined): string {
  const id = payload?.id
  return typeof id === "string" && id.length > 0 ? id : "text"
}

function errorText(value: unknown): string {
  if (typeof value === "string") {
    return value
  }

  if (value instanceof Error) {
    return value.message
  }

  try {
    return JSON.stringify(value)
  } catch {
    return "Terjadi kesalahan pada assistant."
  }
}

function mapChunk(chunk: MastraChunk): UIMessageChunk[] {
  const payload = chunk.payload

  switch (chunk.type) {
    case "text-start":
      return [{ type: "text-start", id: textId(payload) }]
    case "text-delta":
      return [
        {
          type: "text-delta",
          id: textId(payload),
          delta: typeof payload?.text === "string" ? payload.text : "",
        },
      ]
    case "text-end":
      return [{ type: "text-end", id: textId(payload) }]
    case "reasoning-start":
      return [{ type: "reasoning-start", id: textId(payload) }]
    case "reasoning-delta":
      return [
        {
          type: "reasoning-delta",
          id: textId(payload),
          delta: typeof payload?.text === "string" ? payload.text : "",
        },
      ]
    case "reasoning-end":
      return [{ type: "reasoning-end", id: textId(payload) }]
    case "tool-call-input-streaming-start":
      return [
        {
          type: "tool-input-start",
          toolCallId: String(payload?.toolCallId ?? ""),
          toolName: String(payload?.toolName ?? ""),
          providerExecuted:
            typeof payload?.providerExecuted === "boolean"
              ? payload.providerExecuted
              : undefined,
          dynamic:
            typeof payload?.dynamic === "boolean" ? payload.dynamic : undefined,
        },
      ]
    case "tool-call-delta":
      return [
        {
          type: "tool-input-delta",
          toolCallId: String(payload?.toolCallId ?? ""),
          inputTextDelta:
            typeof payload?.argsTextDelta === "string"
              ? payload.argsTextDelta
              : "",
        },
      ]
    case "tool-call":
      return [
        {
          type: "tool-input-available",
          toolCallId: String(payload?.toolCallId ?? ""),
          toolName: String(payload?.toolName ?? ""),
          input: payload?.args ?? {},
          providerExecuted:
            typeof payload?.providerExecuted === "boolean"
              ? payload.providerExecuted
              : undefined,
          title: typeof payload?.title === "string" ? payload.title : undefined,
        },
      ]
    case "tool-result":
      if (payload?.isError) {
        return [
          {
            type: "tool-output-error",
            toolCallId: String(payload?.toolCallId ?? ""),
            errorText: errorText(payload.result),
          },
        ]
      }
      return [
        {
          type: "tool-output-available",
          toolCallId: String(payload?.toolCallId ?? ""),
          output: payload?.result,
        },
      ]
    case "tool-error":
      return [
        {
          type: "tool-output-error",
          toolCallId: String(payload?.toolCallId ?? ""),
          errorText: errorText(payload?.error),
        },
      ]
    case "error":
      return [{ type: "error", errorText: errorText(payload?.error) }]
    case "abort":
      return [{ type: "abort" }]
    case "finish":
      return [{ type: "finish" }]
    default:
      return []
  }
}

export class MastraChatTransport implements ChatTransport<UIMessage> {
  private readonly threadId: string

  constructor(threadId: string) {
    this.threadId = threadId
  }

  async sendMessages({
    messages,
    abortSignal,
  }: Parameters<ChatTransport<UIMessage>["sendMessages"]>[0]): Promise<
    ReadableStream<UIMessageChunk>
  > {
    const text = lastUserText(messages)

    if (!text) {
      throw new Error("Pesan tidak boleh kosong.")
    }

    const response = await getAssistantAgent().stream(text, {
      memory: { thread: this.threadId },
      abortSignal,
    })

    return new ReadableStream<UIMessageChunk>({
      async start(controller) {
        controller.enqueue({
          type: "start",
          messageId: crypto.randomUUID(),
        })

        try {
          await response.processDataStream({
            onChunk: (chunk) => {
              for (const part of mapChunk(chunk as MastraChunk)) {
                controller.enqueue(part)
              }
            },
          })
          controller.close()
        } catch (streamError) {
          controller.error(streamError)
        }
      },
    })
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null
  }
}
