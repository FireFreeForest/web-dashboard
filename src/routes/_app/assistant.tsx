import { createFileRoute } from "@tanstack/react-router"

import { AssistantLayout } from "@/components/assistant/assistant-layout"
import { pageTitle } from "@/lib/site"

type AssistantSearch = {
  thread?: string
}

export const Route = createFileRoute("/_app/assistant")({
  staticData: { crumb: "Assistant" },
  head: () => ({
    meta: [{ title: pageTitle("Assistant") }],
  }),
  validateSearch: (search: Record<string, unknown>): AssistantSearch => ({
    thread: typeof search.thread === "string" ? search.thread : undefined,
  }),
  component: AssistantPage,
})

function AssistantPage() {
  const { thread } = Route.useSearch()

  return <AssistantLayout activeThreadId={thread} />
}
