import { apiFetch } from "@/lib/api/client"

import {
  deleteWebPushToken,
  getNotificationPermission,
  getWebPushToken,
} from "./fcm"
import {
  clearStoredPushToken,
  getStoredPushToken,
  isPushDisabled,
  saveStoredPushToken,
  setPushDisabled,
} from "./token-storage"
import type { PushPlatform } from "./types"

const WEB_PLATFORM: PushPlatform = "web"
const SYNC_CHECK_INTERVAL_MS = 60_000

let lastSyncCheckAt = 0

type SyncPushTokenOptions = {
  force?: boolean
}

type RemovePushTokenOptions = {
  persistDisabled?: boolean
}

export async function syncPushToken({
  force = false,
}: SyncPushTokenOptions = {}): Promise<string | null> {
  if (isPushDisabled()) {
    return null
  }

  if (!force && Date.now() - lastSyncCheckAt < SYNC_CHECK_INTERVAL_MS) {
    return getStoredPushToken()?.token ?? null
  }

  lastSyncCheckAt = Date.now()

  const token = await getWebPushToken()

  if (!token) {
    return null
  }

  const stored = getStoredPushToken()
  const isAlreadyRegistered =
    stored?.token === token && stored.platform === WEB_PLATFORM

  if (!force && isAlreadyRegistered) {
    return token
  }

  await apiFetch<void>({
    method: "POST",
    url: "/push/tokens",
    data: { token, platform: WEB_PLATFORM },
  })

  saveStoredPushToken({ token, platform: WEB_PLATFORM })
  setPushDisabled(false)

  return token
}

export async function removePushToken({
  persistDisabled = true,
}: RemovePushTokenOptions = {}): Promise<void> {
  const stored = getStoredPushToken()
  const token =
    stored?.token ??
    (getNotificationPermission() === "granted" ? await getWebPushToken() : null)

  if (token) {
    await apiFetch<void>({
      method: "DELETE",
      url: `/push/tokens/${encodeURIComponent(token)}`,
    })
  }

  await deleteWebPushToken()
  clearStoredPushToken()

  if (persistDisabled) {
    setPushDisabled(true)
  }

  lastSyncCheckAt = 0
}
