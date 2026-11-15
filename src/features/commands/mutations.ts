import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import { commandKeys } from "./queries"
import type { Command, IssueCommandInput } from "./types"

export function useIssueCommand() {
  const queryClient = useQueryClient()

  return useMutation<
    Command,
    ApiError,
    { deviceId: string; input: IssueCommandInput; idempotencyKey?: string }
  >({
    mutationFn: ({ deviceId, input, idempotencyKey }) =>
      apiFetch<Command>({
        method: "POST",
        url: `/devices/${deviceId}/commands`,
        data: input,
        headers: idempotencyKey
          ? { "Idempotency-Key": idempotencyKey }
          : undefined,
      }),
    onSuccess: (_command, { deviceId }) => {
      void queryClient.invalidateQueries({
        queryKey: commandKeys.lists(deviceId),
      })
    },
  })
}
