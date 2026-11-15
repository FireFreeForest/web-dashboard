import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"

import "./index.css"
import { MapModeProvider } from "@/components/providers/map-mode-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { installAuthInterceptors } from "@/features/auth/http"
import { setSessionExpiredHandler } from "@/features/auth/session"
import { router } from "@/router"

installAuthInterceptors()

setSessionExpiredHandler(() => {
  if (router.state.location.pathname === "/auth") {
    return
  }

  void router.navigate({
    to: "/auth",
    search: { redirect: router.state.location.href },
    replace: true,
  })
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <MapModeProvider>
          <RouterProvider router={router} />
        </MapModeProvider>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
)
