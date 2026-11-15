import type { AxiosError, InternalAxiosRequestConfig } from "axios"

import { api, toApiError } from "@/lib/api/client"

import { clearSession, refreshSession } from "./session"
import { getTokens } from "./token-storage"

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
    skipAuthRefresh?: boolean
    _retry?: boolean
  }
}

let installed = false

export function installAuthInterceptors(): void {
  if (installed) {
    return
  }

  installed = true

  api.interceptors.request.use((config) => {
    if (!config.skipAuth) {
      const tokens = getTokens()

      if (tokens?.access_token) {
        config.headers.set("Authorization", `Bearer ${tokens.access_token}`)
      }
    }

    return config
  })

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig | undefined

      if (!config) {
        return Promise.reject(toApiError(error))
      }

      const apiError = toApiError(error)

      if (
        apiError.status === 401 &&
        apiError.code === "invalid_token" &&
        !config.skipAuthRefresh &&
        !config._retry
      ) {
        config._retry = true

        try {
          await refreshSession()
          return api.request(config)
        } catch (refreshError) {
          return Promise.reject(toApiError(refreshError))
        }
      }

      if (
        apiError.status === 401 &&
        apiError.code === "invalid_token" &&
        config._retry
      ) {
        clearSession()
      }

      if (apiError.status === 403 && apiError.code === "account_inactive") {
        clearSession()
      }

      return Promise.reject(apiError)
    }
  )
}
