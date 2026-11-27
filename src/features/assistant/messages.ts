import type { UIMessage } from "ai"

type StoredToolInvocation = {
  toolCallId?: string
  toolName?: string
  args?: unknown
  result?: unknown
  state?: string
  isError?: boolean
  errorText?: string
}

type StoredPart = {
  type?: string
  text?: string
  reasoning?: string
  toolInvocation?: StoredToolInvocation
}

type StoredMessage = {
  id?: string
  role?: string
  content?: unknown
  createdAt?: string
}

type MessagePart = UIMessage["parts"][number]

function textPart(text: string): MessagePart {
  return { type: "text", text }
}

function toolPart(invocation: StoredToolInvocation): MessagePart | null {
  const toolName = invocation.toolName

  if (!toolName) {
    return null
  }

  const toolCallId = invocation.toolCallId ?? crypto.randomUUID()
  const state = invocation.state
  const isError = invocation.isError || state === "output-error"
  const hasResult =
    state === "result" ||
    state === "output-available" ||
    invocation.result !== undefined

  if (isError) {
    return {
      type: `tool-${toolName}`,
      toolCallId,
      state: "output-error",
      input: invocation.args,
      errorText: invocation.errorText ?? "Tool gagal dijalankan.",
    } as MessagePart
  }

  if (hasResult) {
    return {
      type: `tool-${toolName}`,
      toolCallId,
      state: "output-available",
      input: invocation.args,
      output: invocation.result,
    } as MessagePart
  }

  return {
    type: `tool-${toolName}`,
    toolCallId,
    state: "input-available",
    input: invocation.args,
  } as MessagePart
}

function convertPart(part: StoredPart): MessagePart[] {
  if (!part || typeof part !== "object") {
    return []
  }

  if (part.type === "text" && typeof part.text === "string") {
    return [textPart(part.text)]
  }

  if (part.type === "reasoning") {
    const text = part.reasoning ?? part.text
    return typeof text === "string" && text.length > 0
      ? ([{ type: "reasoning", text, state: "done" }] as MessagePart[])
      : []
  }

  if (part.type === "tool-invocation" && part.toolInvocation) {
    const converted = toolPart(part.toolInvocation)
    return converted ? [converted] : []
  }

  if (part.type === "source-url" || part.type === "source-document") {
    return []
  }

  return []
}

function contentToParts(content: unknown): MessagePart[] {
  if (typeof content === "string") {
    return content ? [textPart(content)] : []
  }

  if (Array.isArray(content)) {
    return content.flatMap((part) =>
      typeof part === "string"
        ? [textPart(part)]
        : convertPart(part as StoredPart)
    )
  }

  if (content && typeof content === "object") {
    const object = content as {
      parts?: unknown
      content?: unknown
    }

    if (Array.isArray(object.parts)) {
      return object.parts.flatMap((part) =>
        typeof part === "string"
          ? [textPart(part)]
          : convertPart(part as StoredPart)
      )
    }

    if (typeof object.content === "string") {
      return object.content ? [textPart(object.content)] : []
    }
  }

  return []
}

function normalizeRole(role?: string): UIMessage["role"] {
  if (role === "user" || role === "assistant" || role === "system") {
    return role
  }

  return "assistant"
}

export function storedMessagesToUI(
  messages: StoredMessage[] | undefined
): UIMessage[] {
  return (messages ?? []).map((message) => ({
    id: message.id ?? crypto.randomUUID(),
    role: normalizeRole(message.role),
    parts: contentToParts(message.content),
  }))
}
