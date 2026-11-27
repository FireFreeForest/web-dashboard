import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, MessageAdd01Icon } from "@hugeicons/core-free-icons"

import { AssistantChat } from "@/components/assistant/assistant-chat"
import { AssistantComposer } from "@/components/assistant/assistant-composer"
import {
  AssistantEmpty,
  AssistantSuggestions,
} from "@/components/assistant/assistant-empty"
import { AssistantThreadSidebar } from "@/components/assistant/assistant-thread-sidebar"
import { Button } from "@/components/ui/button"
import { useAssistantThreads } from "@/features/assistant/queries"
import { cn } from "@/lib/utils"

type PendingPrompt = {
  threadId: string
  text: string
}

export function AssistantLayout({
  activeThreadId,
}: {
  activeThreadId?: string
}) {
  const navigate = useNavigate()
  const threadsQuery = useAssistantThreads()
  const [pendingPrompt, setPendingPrompt] = useState<PendingPrompt | null>(null)
  const [draft, setDraft] = useState("")

  const hasThread = Boolean(activeThreadId)

  const activeThread = threadsQuery.data?.threads.find(
    (thread) => thread.id === activeThreadId
  )
  const title = activeThread?.title?.trim() || "Chat baru"
  const isNewThread =
    Boolean(activeThreadId) && pendingPrompt?.threadId === activeThreadId

  const goToThread = (threadId: string) => {
    setPendingPrompt(null)
    void navigate({
      to: "/assistant",
      search: { thread: threadId },
      replace: true,
    })
  }

  const newChat = () => {
    const threadId = crypto.randomUUID()
    setPendingPrompt({ threadId, text: "" })
    void navigate({
      to: "/assistant",
      search: { thread: threadId },
      replace: true,
    })
  }

  const backToMenu = () => {
    setPendingPrompt(null)
    void navigate({
      to: "/assistant",
      search: {},
      replace: true,
    })
  }

  const startNewChat = (text: string) => {
    const threadId = crypto.randomUUID()
    setPendingPrompt({ threadId, text })
    setDraft("")
    void navigate({
      to: "/assistant",
      search: { thread: threadId },
      replace: true,
    })
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside
        className={cn(
          "flex min-h-0 w-full shrink-0 flex-col gap-2 p-3 lg:w-64 lg:border-r",
          hasThread && "hidden lg:flex"
        )}
      >
        <h1 className="px-2 py-1.5 font-heading text-lg font-semibold tracking-tight">
          Assistant
        </h1>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start px-2 font-normal"
          onClick={newChat}
        >
          <HugeiconsIcon icon={MessageAdd01Icon} data-icon="inline-start" />
          Chat baru
        </Button>
        <AssistantThreadSidebar
          activeThreadId={activeThreadId}
          onSelectThread={goToThread}
          onActiveThreadDeleted={backToMenu}
        />
      </aside>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          !hasThread && "hidden lg:flex"
        )}
      >
        <header className="flex h-14 shrink-0 items-center gap-2 px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Kembali ke daftar percakapan"
            onClick={backToMenu}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
          </Button>
          <h2 className="min-w-0 flex-1 truncate text-sm font-medium">
            {title}
          </h2>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activeThreadId ? (
            <AssistantChat
              key={activeThreadId}
              threadId={activeThreadId}
              isNewThread={isNewThread}
              initialPrompt={
                pendingPrompt?.threadId === activeThreadId
                  ? pendingPrompt.text
                  : undefined
              }
              onInitialPromptConsumed={() => setPendingPrompt(null)}
            />
          ) : (
            <>
              <AssistantEmpty />
              <div className="shrink-0 px-6 pt-2 pb-6">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
                  <AssistantSuggestions onPick={setDraft} />
                  <AssistantComposer
                    value={draft}
                    onValueChange={setDraft}
                    onSend={startNewChat}
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    Assistant dapat membuat kesalahan. Periksa kembali informasi
                    penting.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
