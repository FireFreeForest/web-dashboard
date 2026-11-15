import type { TokenPair } from "./types"

const STORAGE_KEY = "fff.auth.tokens"

export function getTokens(): TokenPair | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<TokenPair>

    if (
      typeof parsed.access_token !== "string" ||
      typeof parsed.refresh_token !== "string" ||
      typeof parsed.access_expires_at !== "string" ||
      typeof parsed.refresh_expires_at !== "string"
    ) {
      return null
    }

    return parsed as TokenPair
  } catch {
    return null
  }
}

export function saveTokens(tokens: TokenPair): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasSession(): boolean {
  return getTokens() !== null
}
