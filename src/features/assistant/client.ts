import { MastraClient } from "@mastra/client-js"

import { refreshSession } from "@/features/auth/session"
import { getTokens } from "@/features/auth/token-storage"
import { API_BASE_URL } from "@/lib/api/config"

import { ASSISTANT_AGENT_ID } from "./types"

function withAccessToken(headers: Headers, token?: string) {
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  } else {
    headers.delete("Authorization")
  }
}

const assistantFetch: typeof fetch = async (input, init) => {
  const headers = new Headers(init?.headers)
  withAccessToken(headers, getTokens()?.access_token)

  let response = await fetch(input, { ...init, headers })

  if (response.status === 401) {
    try {
      const nextTokens = await refreshSession()
      withAccessToken(headers, nextTokens.access_token)
      response = await fetch(input, { ...init, headers })
    } catch {
      return response
    }
  }

  return response
}

const assistantBaseUrl = `${API_BASE_URL.replace(/\/+$/, "")}/mastra`

export const assistantClient = new MastraClient({
  baseUrl: assistantBaseUrl,
  fetch: assistantFetch,
  retries: 1,
})

export function getAssistantAgent() {
  return assistantClient.getAgent(ASSISTANT_AGENT_ID)
}
