import axios, { type AxiosRequestConfig } from "axios"

import { API_BASE_URL } from "./config"
import {
  ApiError,
  type ApiEnvelope,
  type ApiErrorBody,
  type ListEnvelope,
} from "./types"

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
})

function parseRetryAfter(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined
  }

  const seconds = Number(value)
  return Number.isFinite(seconds) ? seconds : undefined
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const body = error.response?.data as ApiErrorBody | undefined

    return new ApiError({
      status,
      code: body?.error?.code ?? "network_error",
      message: body?.error?.message ?? error.message,
      retryAfterSeconds: parseRetryAfter(
        error.response?.headers?.["retry-after"]
      ),
    })
  }

  return new ApiError({
    status: 0,
    code: "unknown_error",
    message: error instanceof Error ? error.message : "Unexpected error",
  })
}

export async function apiFetch<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.request<ApiEnvelope<T>>(config)

    if (response.status === 204) {
      return undefined as T
    }

    return response.data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function apiFetchList<T>(
  config: AxiosRequestConfig
): Promise<ListEnvelope<T>> {
  try {
    const response = await api.request<ListEnvelope<T>>(config)
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}
