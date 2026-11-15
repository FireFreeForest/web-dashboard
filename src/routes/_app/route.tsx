import type { QueryClient } from "@tanstack/react-query"
import {
  Outlet,
  createFileRoute,
  redirect,
  useMatchRoute,
  type ParsedLocation,
} from "@tanstack/react-router"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { meQueryOptions } from "@/features/auth/queries"
import { clearSession } from "@/features/auth/session"
import { hasSession } from "@/features/auth/token-storage"
import { ApiError } from "@/lib/api/types"
import { cn } from "@/lib/utils"

type AppBeforeLoadContext = {
  context: { queryClient: QueryClient }
  location: ParsedLocation
}

export const Route = createFileRoute("/_app")({
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
  const matchRoute = useMatchRoute()
  const isDashboard = Boolean(matchRoute({ to: "/", fuzzy: false }))

  return (
    <SidebarProvider
      className={cn(isDashboard && "[&_[data-slot=sidebar-gap]]:w-0!")}
    >
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
