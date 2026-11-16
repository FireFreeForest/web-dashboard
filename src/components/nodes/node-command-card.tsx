import { HugeiconsIcon } from "@hugeicons/react"
import { WaterPumpIcon } from "@hugeicons/core-free-icons"

import { IssueCommandDialog } from "@/components/commands/issue-command-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useMe } from "@/features/auth/queries"

export function NodeCommandCard({
  deviceId,
  pump,
}: {
  deviceId: string
  pump: boolean | null
}) {
  const { data: user } = useMe()
  const canIssue = user?.role === "admin" || user?.role === "petugas"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Command</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon
              icon={WaterPumpIcon}
              strokeWidth={2}
              className="size-5 text-muted-foreground"
            />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Water Pump</span>
            <Badge
              variant={pump ? "secondary" : "outline"}
              className="w-fit"
            >
              {pump == null ? "—" : pump ? "ON" : "OFF"}
            </Badge>
          </div>
        </div>
        {canIssue ? (
          <IssueCommandDialog
            deviceId={deviceId}
            triggerLabel={pump ? "Turn Off" : "Turn On"}
          />
        ) : (
          <span className="text-xs text-muted-foreground">
            Hanya admin/petugas
          </span>
        )}
      </CardContent>
    </Card>
  )
}
