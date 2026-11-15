import { createFileRoute } from "@tanstack/react-router"

import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent } from "@/components/ui/card"

export const Route = createFileRoute("/auth")({
  staticData: { crumb: "Sign in" },
  component: AuthPage,
})

function AuthPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm">
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
