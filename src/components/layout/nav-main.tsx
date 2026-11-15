import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  ServerStackIcon,
  TimelineEventIcon,
} from "@hugeicons/core-free-icons"
import { Link, useMatchRoute } from "@tanstack/react-router"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", to: "/", icon: DashboardSquare01Icon, exact: true },
  { title: "Nodes", to: "/nodes", icon: ServerStackIcon, exact: false },
  { title: "Events", to: "/events", icon: TimelineEventIcon, exact: false },
] as const

export function NavMain() {
  const matchRoute = useMatchRoute()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = Boolean(
            matchRoute({ to: item.to, fuzzy: !item.exact })
          )

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                render={<Link to={item.to} />}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
