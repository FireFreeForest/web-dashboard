import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/features/auth/types"

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  petugas: "Petugas",
  viewer: "Viewer",
}

const ROLE_VARIANT: Record<
  UserRole,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  admin: "default",
  petugas: "secondary",
  viewer: "outline",
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={ROLE_VARIANT[role]}>{ROLE_LABEL[role]}</Badge>
}
