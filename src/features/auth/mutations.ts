import { useMutation, useQueryClient } from "@tanstack/react-query"

import { removePushToken } from "@/features/push/registration"
import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import { authKeys } from "./queries"
import { clearTokens, getTokens, saveTokens } from "./token-storage"
import type { LoginInput, LoginResult } from "./types"

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation<LoginResult, ApiError, LoginInput>({
    mutationFn: async (input: LoginInput) => {
      const result = await apiFetch<LoginResult>({
        method: "POST",
        url: "/auth/login",
        data: input,
        skipAuth: true,
        skipAuthRefresh: true,
      })

      saveTokens(result.tokens)
      return result
    },
    onSuccess: (result) => {
      queryClient.setQueryData(authKeys.me(), result.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const tokens = getTokens()

      try {
        await removePushToken({ persistDisabled: false })
      } catch (error) {
        console.error("Gagal menghapus token notifikasi push:", error)
      }

      clearTokens()
      queryClient.removeQueries()

      if (!tokens) {
        return
      }

      void apiFetch<void>({
        method: "POST",
        url: "/auth/logout",
        data: { refresh_token: tokens.refresh_token },
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        skipAuth: true,
        skipAuthRefresh: true,
      }).catch(() => undefined)
    },
  })
}
