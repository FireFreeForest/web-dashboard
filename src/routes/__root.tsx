import type { QueryClient } from "@tanstack/react-query"
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { RouteError } from "@/components/feedback/route-error"
import { RoutePending } from "@/components/feedback/route-pending"
import { Button } from "@/components/ui/button"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  pendingComponent: RoutePending,
  errorComponent: RouteError,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV ? (
        <TanStackRouterDevtools position="bottom-right" />
      ) : null}
    </>
  )
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Halaman tidak ditemukan
      </h1>
      <p className="text-sm text-muted-foreground">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Button size="sm" variant="outline" render={<Link to="/" />}>
        Kembali ke dasbor
      </Button>
    </div>
  )
}
