import type { RegisterPushTokenInput } from "./types"

const STORAGE_KEY = "fff.push.token"

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
