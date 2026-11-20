/* global firebase, clients */
importScripts(
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-app-compat.js"
)
importScripts(
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-messaging-compat.js"
)

firebase.initializeApp({
  apiKey: "AIzaSyAmdiU8kbyjUe5mlMTzI8GpB72qHeeZCes",
  authDomain: "firefreeforest.firebaseapp.com",
  projectId: "firefreeforest",
  storageBucket: "firefreeforest.firebasestorage.app",
  messagingSenderId: "260603605779",
  appId: "1:260603605779:web:2f539a6e2720955389e0e6",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {}
  const title = payload.notification?.title || "Fire Free Forest"
  const body = payload.notification?.body || ""

  self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.event_id || undefined,
    data,
  })
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const target = new URL("/events", self.location.origin).href

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (new URL(client.url).origin === self.location.origin) {
            return client.focus().then(() => client.navigate(target))
          }
        }

        return clients.openWindow(target)
      })
  )
})
