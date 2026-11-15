import { HugeiconsIcon } from "@hugeicons/react"
import { SidebarLeftIcon } from "@hugeicons/core-free-icons"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function SidebarCollapse() {
  const { isMobile, state, toggleSidebar } = useSidebar()

  if (isMobile) {
    return null
  }

  const label = state === "expanded" ? "Collapse" : "Expand"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={`${label} sidebar`} onClick={toggleSidebar}>
          <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} />
          <span>{label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
