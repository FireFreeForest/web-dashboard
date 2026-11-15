import { Badge } from "@/components/ui/badge"

export function UserStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "secondary" : "destructive"}>
      <span
        aria-hidden
        className={
          active
            ? "size-1.5 rounded-full bg-emerald-500"
            : "size-1.5 rounded-full bg-current"
        }
      />
      {active ? "Active" : "Inactive"}
    </Badge>
  )
}
