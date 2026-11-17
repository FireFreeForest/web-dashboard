import { createFileRoute } from "@tanstack/react-router"

import { EventsTable } from "@/components/events/events-table"

export const Route = createFileRoute("/_app/events")({
  staticData: { crumb: "Events" },
  component: EventsPage,
})

function EventsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Events
        </h1>
        <p className="text-sm text-muted-foreground">
          Peringatan dan aktivitas dari Device yang terhubung.
        </p>
      </header>

      <EventsTable />
    </div>
  )
}
