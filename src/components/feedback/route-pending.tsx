import { Skeleton } from "@/components/ui/skeleton"

export function RoutePending() {
  return (
    <div className="flex flex-col gap-3 p-6">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
    </div>
  )
}
