import type { RegisterPushTokenInput } from "./types"

const STORAGE_KEY = "fff.push.token"
const DISABLED_KEY = "fff.push.disabled"

export function getStoredPushToken(): RegisterPushTokenInput | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<RegisterPushTokenInput>

    if (typeof parsed.token !== "string" || parsed.token.trim() === "") {
      return null
    }

    return {
      token: parsed.token,
      platform:
        typeof parsed.platform === "string" ? parsed.platform : undefined,
    }
  } catch {
    return null
  }
}

export function saveStoredPushToken(input: RegisterPushTokenInput): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(input))
}

export function clearStoredPushToken(token?: string): void {
  if (token === undefined) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }

  if (getStoredPushToken()?.token === token) {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function isPushDisabled(): boolean {
  try {
    return localStorage.getItem(DISABLED_KEY) === "true"
  } catch {
    return false
  }
}

export function setPushDisabled(disabled: boolean): void {
  try {
    if (disabled) {
      localStorage.setItem(DISABLED_KEY, "true")
      return
    }

    localStorage.removeItem(DISABLED_KEY)
  } catch {
    // Ignore storage failures; disabling is best-effort.
  }
}
