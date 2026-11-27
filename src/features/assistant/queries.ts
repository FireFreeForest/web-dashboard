import { useQuery } from "@tanstack/react-query"

import { assistantClient } from "./client"
import { ASSISTANT_AGENT_ID } from "./types"

export const assistantKeys = {
  all: ["assistant"] as const,
  threads: () => [...assistantKeys.all, "threads"] as const,
  messages: (threadId: string) =>
    [...assistantKeys.all, "messages", threadId] as const,
}

export function useAssistantThreads(enabled = true) {
  return useQuery({
    queryKey: assistantKeys.threads(),
    enabled,
    queryFn: async () => {
      const result = await assistantClient.listMemoryThreads({
        agentId: ASSISTANT_AGENT_ID,
        orderBy: { field: "updatedAt", direction: "DESC" },
        perPage: 50,
      })

      return {
        ...result,
        threads: [...(result.threads ?? [])].sort((left, right) => {
          const leftTime = new Date(
            left.updatedAt ?? left.createdAt ?? 0
          ).getTime()
          const rightTime = new Date(
            right.updatedAt ?? right.createdAt ?? 0
          ).getTime()
          return rightTime - leftTime
        }),
      }
    },
  })
}

export function useAssistantMessages(threadId?: string, enabled = true) {
  return useQuery({
    queryKey: assistantKeys.messages(threadId ?? ""),
    enabled: Boolean(threadId && enabled),
    retry: false,
    queryFn: () =>
      assistantClient.listThreadMessages(threadId!, {
        agentId: ASSISTANT_AGENT_ID,
        orderBy: { field: "createdAt", direction: "ASC" },
        perPage: 100,
      }),
  })
}
