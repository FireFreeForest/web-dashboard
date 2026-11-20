import {
  deleteToken,
  getToken,
  onMessage,
  type MessagePayload,
} from "firebase/messaging"

import { getMessagingInstance } from "@/lib/firebase/client"
import { FIREBASE_VAPID_KEY } from "@/lib/firebase/config"

const SERVICE_WORKER_PATH = "/firebase-messaging-sw.js"
const SERVICE_WORKER_TIMEOUT_MS = 10_000

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  )
}

export async function isWebPushAvailable(): Promise<boolean> {
  if (!isPushSupported()) {
    return false
  }

  return (await getMessagingInstance()) !== null
}

export function getNotificationPermission(): NotificationPermission | null {
  if (!isPushSupported()) {
    return null
  }

  return Notification.permission
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    return "denied"
  }

  if (Notification.permission !== "default") {
    return Notification.permission
  }

  return Notification.requestPermission()
}

export function getPushErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const customData = (
      error as Error & { customData?: { errorInfo?: string } }
    ).customData

    return customData?.errorInfo
      ? `${error.message} (${customData.errorInfo})`
      : error.message
  }

  return String(error)
}

async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/" })
}

function waitForServiceWorkerActivation(
  registration: ServiceWorkerRegistration
): Promise<void> {
  if (registration.active) {
    return Promise.resolve()
  }

  const pendingWorker = registration.installing ?? registration.waiting

  if (!pendingWorker) {
    return Promise.reject(
      new Error("Service worker tidak dapat dipasang oleh browser.")
    )
  }

  const worker: ServiceWorker = pendingWorker

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      worker.removeEventListener("statechange", handleStateChange)
      reject(new Error("Service worker tidak aktif tepat waktu."))
    }, SERVICE_WORKER_TIMEOUT_MS)

    function handleStateChange() {
      if (worker.state === "activated") {
        window.clearTimeout(timeout)
        worker.removeEventListener("statechange", handleStateChange)
        resolve()
        return
      }

      if (worker.state === "redundant") {
        window.clearTimeout(timeout)
        worker.removeEventListener("statechange", handleStateChange)
        reject(new Error("Service worker gagal dipasang."))
      }
    }

    worker.addEventListener("statechange", handleStateChange)
  })
}

async function resetPushSubscription(
  registration: ServiceWorkerRegistration
): Promise<void> {
  try {
    const subscription = await registration.pushManager.getSubscription()
    await subscription?.unsubscribe()
  } catch {
    // Ignore cleanup failures and let the retry surface the real error.
  }
}

export async function getWebPushToken(): Promise<string | null> {
  const messaging = await getMessagingInstance()

  if (!messaging || !FIREBASE_VAPID_KEY) {
    return null
  }

  const registration = await registerMessagingServiceWorker()

  await waitForServiceWorkerActivation(registration)
  await navigator.serviceWorker.ready

  try {
    return await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
  } catch {
    await resetPushSubscription(registration)

    return getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
  }
}

export async function deleteWebPushToken(): Promise<void> {
  const messaging = await getMessagingInstance()

  if (!messaging) {
    return
  }

  await deleteToken(messaging).catch(() => undefined)
}

export function subscribeForegroundMessages(
  handler: (payload: MessagePayload) => void
): () => void {
  let active = true
  let unsubscribe: (() => void) | undefined

  void getMessagingInstance().then((messaging) => {
    if (!messaging || !active) {
      return
    }

    unsubscribe = onMessage(messaging, handler)
  })

  return () => {
    active = false
    unsubscribe?.()
  }
}
