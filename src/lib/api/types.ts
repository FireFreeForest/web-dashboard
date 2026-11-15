export type ApiEnvelope<T> = {
  data: T
}

export type ApiErrorBody = {
  error: {
    code: string
    message: string
  }
}

type ApiErrorInit = {
  status: number
  code: string
  message: string
  retryAfterSeconds?: number
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly retryAfterSeconds?: number

  constructor({ status, code, message, retryAfterSeconds }: ApiErrorInit) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.retryAfterSeconds = retryAfterSeconds
  }
}
