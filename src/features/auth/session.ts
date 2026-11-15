import { api, toApiError } from "@/lib/api/client"
import { ApiError, type ApiEnvelope } from "@/lib/api/types"
import { queryClient } from "@/lib/query-client"

import { clearTokens, getTokens, saveTokens } from "./token-storage"
import type { TokenPair } from "./types"

let refreshPromise: Promise<TokenPair> | null = null
let sessionExpiredHandler: (() => void) | null = null

export function setSessionExpiredHandler(
  handler: (() => void) | null
): void {
  sessionExpiredHandler = handler
}

export function clearSession({
  notify = true,
}: {
  notify?: boolean
} = {}): void {
  clearTokens()
  queryClient.clear()

  if (notify) {
    sessionExpiredHandler?.()
  }
}

async function requestRefresh(): Promise<TokenPair> {
  const tokens = getTokens()

  if (!tokens?.refresh_token) {
    throw new ApiError({
      status: 401,
      code: "invalid_token",
      message: "No refresh token available",
    })
  }

  try {
    const response = await api.post<ApiEnvelope<TokenPair>>(
      "/auth/refresh",
      { refresh_token: tokens.refresh_token },
      { skipAuth: true, skipAuthRefresh: true }
    )
    const nextTokens = response.data.data

    if (getTokens()?.refresh_token === tokens.refresh_token) {
      saveTokens(nextTokens)
    }

    return nextTokens
  } catch (error) {
    const apiError = toApiError(error)

    if (apiError.status === 401 || apiError.status === 403) {
      clearSession()
    }

    throw apiError
  }
}

export function refreshSession(): Promise<TokenPair> {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}
