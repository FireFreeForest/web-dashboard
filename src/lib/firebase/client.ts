import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from "firebase/app"
import { getMessaging, isSupported, type Messaging } from "firebase/messaging"

import { firebaseConfig, isFirebaseConfigured } from "./config"

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
}

let messagingPromise: Promise<Messaging | null> | null = null

export function getMessagingInstance(): Promise<Messaging | null> {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      if (!isFirebaseConfigured()) {
        return null
      }

      const supported = await isSupported().catch(() => false)

      if (!supported) {
        return null
      }

      const app = getFirebaseApp()

      return app ? getMessaging(app) : null
    })()
  }

  return messagingPromise
}
