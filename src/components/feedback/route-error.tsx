import { Link } from "@tanstack/react-router"
import type { ErrorComponentProps } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error instanceof Error
          ? error.message
          : "An unexpected error occurred."}
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={reset}>
          Try again
        </Button>
        <Button size="sm" variant="outline" render={<Link to="/" />}>
          Go home
        </Button>
      </div>
    </div>
  )
}
