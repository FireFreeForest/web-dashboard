import type { QueryClient } from "@tanstack/react-query"
import {
  Outlet,
  createFileRoute,
  redirect,
  type ParsedLocation,
} from "@tanstack/react-router"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { PushProvider } from "@/components/providers/push-provider"
import { RealtimeProvider } from "@/components/providers/realtime-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { meQueryOptions } from "@/features/auth/queries"
import { clearSession } from "@/features/auth/session"
import { hasSession } from "@/features/auth/token-storage"
import { ApiError } from "@/lib/api/types"

type AppBeforeLoadContext = {
  context: { queryClient: QueryClient }
  location: ParsedLocation
}

export const Route = createFileRoute("/_app")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: async ({ context, location }: AppBeforeLoadContext) => {
    if (!hasSession()) {
      throw redirect({ to: "/auth", search: { redirect: location.href } })
    }

    try {
      await context.queryClient.ensureQueryData(meQueryOptions())
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403 || error.status === 404)
      ) {
        clearSession({ notify: false })
        throw redirect({ to: "/auth", search: { redirect: location.href } })
      }

      throw error
    }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <PushProvider>
      <RealtimeProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <div className="flex min-h-0 flex-1 flex-col">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </RealtimeProvider>
    </PushProvider>
  )
}
