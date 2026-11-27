import { useMutation, useQueryClient } from "@tanstack/react-query"

import { assistantClient } from "./client"
import { assistantKeys } from "./queries"
import { ASSISTANT_AGENT_ID } from "./types"

export function useRenameAssistantThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ threadId, title }: { threadId: string; title: string }) =>
      assistantClient
        .getMemoryThread({ threadId, agentId: ASSISTANT_AGENT_ID })
        .update({ title }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assistantKeys.threads() })
    },
  })
}

export function useDeleteAssistantThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (threadId: string) =>
      assistantClient
        .getMemoryThread({ threadId, agentId: ASSISTANT_AGENT_ID })
        .delete(),
    onSuccess: (_result, threadId) => {
      queryClient.removeQueries({
        queryKey: assistantKeys.messages(threadId),
      })
      void queryClient.invalidateQueries({ queryKey: assistantKeys.threads() })
    },
  })
}
