import { HugeiconsIcon } from "@hugeicons/react"
import { LogoutIcon, Settings05Icon } from "@hugeicons/core-free-icons"
import { Link, useNavigate } from "@tanstack/react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from "@/features/auth/mutations"
import type { User } from "@/features/auth/types"
import { getInitials } from "@/lib/user"

export function UserMenuContent({ user }: { user: User }) {
  const navigate = useNavigate()
  const logout = useLogout()
  const initials = getInitials(user.name)

  const handleLogout = async () => {
    await logout.mutateAsync()
    await navigate({ to: "/auth", replace: true })
  }

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem render={<Link to="/settings" />}>
          <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
          Pengaturan
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        disabled={logout.isPending}
        onClick={handleLogout}
      >
        <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
        Keluar
      </DropdownMenuItem>
    </>
  )
}

export function UserMenu({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Buka menu pengguna" />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
        <UserMenuContent user={user} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
