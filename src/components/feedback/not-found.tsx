import { FileNotFoundIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function NotFound() {
  return (
    <Empty className="min-h-svh justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={FileNotFoundIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>Halaman tidak ditemukan</EmptyTitle>
        <EmptyDescription>
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link to="/" />}>Kembali ke dasbor</Button>
      </EmptyContent>
    </Empty>
  )
}
