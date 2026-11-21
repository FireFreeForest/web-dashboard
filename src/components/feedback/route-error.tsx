import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import type { ErrorComponentProps } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <Empty className="min-h-svh justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>Terjadi kesalahan</EmptyTitle>
        <EmptyDescription>
          {error instanceof Error
            ? error.message
            : "Terjadi kesalahan yang tidak terduga."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={reset}>
            <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
            Coba lagi
          </Button>
          <Button variant="outline" render={<Link to="/" />}>
            Kembali ke beranda
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
