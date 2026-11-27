export const ASSISTANT_AGENT_ID = "fff-data-analyst"

export type AssistantThread = {
  id: string
  title?: string | null
  resourceId?: string
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, unknown>
}

export type AssistantThreadsResponse = {
  threads: AssistantThread[]
  total?: number
  page?: number
  perPage?: number | false
  hasMore?: boolean
}

export type AssistantStoredMessage = {
  id: string
  role: string
  content?: unknown
  createdAt?: string
  threadId?: string
  resourceId?: string
  [key: string]: unknown
}

export type AssistantMessagesResponse = {
  messages: AssistantStoredMessage[]
  uiMessages?: unknown[] | null
  total?: number
  page?: number
  perPage?: number | false
  hasMore?: boolean
}
