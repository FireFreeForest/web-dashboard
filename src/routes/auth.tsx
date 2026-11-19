import type { QueryClient } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"

import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent } from "@/components/ui/card"
import { meQueryOptions } from "@/features/auth/queries"
import { hasSession } from "@/features/auth/token-storage"
import { SITE_URL, pageTitle } from "@/lib/site"

type AuthBeforeLoadContext = {
  context: { queryClient: QueryClient }
}

export const Route = createFileRoute("/auth")({
  staticData: { crumb: "Masuk" },
  head: () => ({
    meta: [
      { title: pageTitle("Masuk") },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/auth` }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string" &&
      search.redirect.startsWith("/") &&
      !search.redirect.startsWith("//")
        ? search.redirect
        : undefined,
  }),
  beforeLoad: async ({ context }: AuthBeforeLoadContext) => {
    if (!hasSession()) {
      return
    }

    try {
      await context.queryClient.ensureQueryData(meQueryOptions())
    } catch {
      return
    }

    throw redirect({ to: "/" })
  },
  component: AuthPage,
})

function AuthPage() {
  const { redirect: redirectTo } = Route.useSearch()

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm">
        <CardContent>
          <LoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </div>
  )
}
