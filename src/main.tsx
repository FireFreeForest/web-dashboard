import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"

import "./index.css"
import { MapModeProvider } from "@/components/providers/map-mode-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { router } from "@/router"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <MapModeProvider>
        <RouterProvider router={router} />
      </MapModeProvider>
    </ThemeProvider>
  </StrictMode>
)
