import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PineTreeIcon } from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import { SidebarCollapse } from "@/components/layout/sidebar-collapse"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useMe } from "@/features/auth/queries"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useMe()

  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Fire Free Forest"
              render={<Link to="/" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <HugeiconsIcon icon={PineTreeIcon} strokeWidth={2} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Fire Free Forest</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Dashboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="hidden md:flex">
        <SidebarCollapse />
        {user ? (
          <NavUser user={user} />
        ) : (
          <Skeleton className="mx-auto size-8 rounded-full" />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
