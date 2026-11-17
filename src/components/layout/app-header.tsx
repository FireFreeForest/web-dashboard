import { useMatches } from "@tanstack/react-router"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/components/layout/user-menu"
import { useMe } from "@/features/auth/queries"

export function AppHeader() {
  const matches = useMatches()
  const { data: user } = useMe()
  const crumb =
    matches
      .slice()
      .reverse()
      .find((match) => match.staticData?.crumb)?.staticData?.crumb ??
    "Dasbor"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
      <SidebarTrigger />
      <Separator
        orientation="vertical"
        className="mr-1 data-vertical:h-4 data-vertical:self-center"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{crumb}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <Skeleton className="size-8 rounded-full" />
        )}
      </div>
    </header>
  )
}
