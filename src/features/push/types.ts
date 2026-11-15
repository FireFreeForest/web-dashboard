import type { RegisterPushTokenFormValues } from "./schema"

export const PUSH_PLATFORMS = ["web", "android", "ios"] as const

export type PushPlatform = (typeof PUSH_PLATFORMS)[number]

export const PUSH_PLATFORM_LABELS: Record<PushPlatform, string> = {
  web: "Web",
  android: "Android",
  ios: "iOS",
}

export const DEFAULT_PUSH_PLATFORM: PushPlatform = "web"

export type RegisterPushTokenInput = RegisterPushTokenFormValues
