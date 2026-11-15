import { Outlet, createFileRoute, useMatchRoute } from "@tanstack/react-router"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app")({
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
