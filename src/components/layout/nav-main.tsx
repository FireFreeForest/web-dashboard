import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  ServerStackIcon,
  TimelineEventIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { Link, useMatchRoute } from "@tanstack/react-router"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useMe } from "@/features/auth/queries"

type NavItem = {
  title: string
  to: "/" | "/nodes" | "/events" | "/users"
  icon: IconSvgElement
  exact: boolean
}

const platformItems: NavItem[] = [
  { title: "Dashboard", to: "/", icon: DashboardSquare01Icon, exact: true },
  { title: "Nodes", to: "/nodes", icon: ServerStackIcon, exact: false },
  { title: "Events", to: "/events", icon: TimelineEventIcon, exact: false },
]

const adminItems: NavItem[] = [
  { title: "Users", to: "/users", icon: UserGroupIcon, exact: false },
]

export function NavMain() {
  const matchRoute = useMatchRoute()
  const { isMobile, setOpenMobile } = useSidebar()
  const { data: user } = useMe()
  const isAdmin = user?.role === "admin"

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const renderItems = (items: NavItem[]) =>
    items.map((item) => {
      const isActive = Boolean(matchRoute({ to: item.to, fuzzy: !item.exact }))

      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            onClick={handleNavigate}
            render={<Link to={item.to} />}
          >
            <HugeiconsIcon icon={item.icon} strokeWidth={2} />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>{renderItems(platformItems)}</SidebarMenu>
      </SidebarGroup>
      {isAdmin ? (
        <SidebarGroup>
          <SidebarGroupLabel>Administrator</SidebarGroupLabel>
          <SidebarMenu>{renderItems(adminItems)}</SidebarMenu>
        </SidebarGroup>
      ) : null}
    </>
  )
}
