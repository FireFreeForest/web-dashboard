import { useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { AssistantComposer } from "@/components/assistant/assistant-composer"
import {
  AssistantEmpty,
  AssistantSuggestions,
} from "@/components/assistant/assistant-empty"
import { AssistantMessage } from "@/components/assistant/assistant-message"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Skeleton } from "@/components/ui/skeleton"
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace"
import { assistantErrorMessage } from "@/features/assistant/errors"
import { storedMessagesToUI } from "@/features/assistant/messages"
import {
  assistantKeys,
  useAssistantMessages,
} from "@/features/assistant/queries"
import { MastraChatTransport } from "@/features/assistant/transport"

function historyToMessages(
  data:
    | {
        uiMessages?: unknown[] | null
        messages?: unknown[]
      }
    | undefined
): UIMessage[] {
  if (Array.isArray(data?.uiMessages) && data.uiMessages.length > 0) {
    return data.uiMessages as UIMessage[]
  }

  return storedMessagesToUI(
    data?.messages as Parameters<typeof storedMessagesToUI>[0]
  )
}

export function AssistantChat({
  threadId,
  initialPrompt,
  isNewThread = false,
  onInitialPromptConsumed,
}: {
  threadId: string
  initialPrompt?: string
  isNewThread?: boolean
  onInitialPromptConsumed?: () => void
}) {
  const [draft, setDraft] = useState("")
  const queryClient = useQueryClient()
  const historyQuery = useAssistantMessages(threadId, !isNewThread)
  const hydratedRef = useRef(false)
  const sentInitialPromptRef = useRef(false)
  const onInitialPromptConsumedRef = useRef(onInitialPromptConsumed)

  const transport = useMemo(() => new MastraChatTransport(threadId), [threadId])

  useEffect(() => {
    onInitialPromptConsumedRef.current = onInitialPromptConsumed
  }, [onInitialPromptConsumed])

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    id: threadId,
    transport,
    onError: (chatError) => {
      onInitialPromptConsumedRef.current?.()
      toast.error(assistantErrorMessage(chatError))
    },
    onFinish: () => {
      onInitialPromptConsumedRef.current?.()
      void queryClient.invalidateQueries({ queryKey: assistantKeys.threads() })
      window.setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: assistantKeys.threads(),
        })
      }, 1500)
    },
  })

  const stopRef = useRef(stop)
  const stopTimerRef = useRef<number | null>(null)

  useEffect(() => {
    stopRef.current = stop
  }, [stop])

  useEffect(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }

    return () => {
      // React StrictMode runs an effect cleanup immediately after the first
      // setup. Deferring the stop lets the remount cancel it instead of
      // aborting the first message that was just sent.
      stopTimerRef.current = window.setTimeout(() => {
        stopTimerRef.current = null
        stopRef.current()
      }, 0)
    }
  }, [])

  useEffect(() => {
    if (
      isNewThread ||
      !historyQuery.data ||
      hydratedRef.current ||
      messages.length > 0
    ) {
      return
    }

    hydratedRef.current = true
    setMessages(historyToMessages(historyQuery.data))
  }, [historyQuery.data, isNewThread, messages.length, setMessages])

  useEffect(() => {
    if (!initialPrompt || sentInitialPromptRef.current) {
      return
    }

    sentInitialPromptRef.current = true
    hydratedRef.current = true
    void sendMessage({ text: initialPrompt })
  }, [initialPrompt, sendMessage])

  const busy = status === "submitted" || status === "streaming"
  const showHistorySkeleton =
    !isNewThread && historyQuery.isLoading && messages.length === 0

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        {showHistorySkeleton ? (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-6">
            <Skeleton className="h-16 w-2/3 self-end" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-16 w-1/2 self-end" />
          </div>
        ) : messages.length === 0 ? (
          <AssistantEmpty />
        ) : (
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-6 px-6 py-6">
                  {messages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.role === "user"}
                    >
                      <AssistantMessage
                        message={message}
                        streaming={busy && message === messages.at(-1)}
                      />
                    </MessageScrollerItem>
                  ))}

                  {status === "submitted" ? (
                    <MessageScrollerItem messageId="assistant-pending">
                      <Message>
                        <MessageContent>
                          <Trace>
                            <TraceLine status="running">
                              <TraceIcon>
                                <HugeiconsIcon
                                  icon={Loading03Icon}
                                  strokeWidth={2}
                                  className="animate-spin"
                                />
                              </TraceIcon>
                              <TraceTitle>Menghubungi assistant</TraceTitle>
                            </TraceLine>
                          </Trace>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ) : null}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </div>

      <div className="shrink-0 px-6 pt-2 pb-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          {messages.length === 0 && !showHistorySkeleton ? (
            <AssistantSuggestions onPick={setDraft} />
          ) : null}
          <AssistantComposer
            value={draft}
            onValueChange={setDraft}
            streaming={status === "streaming"}
            disabled={status === "submitted" || showHistorySkeleton}
            onSend={(text) => {
              void sendMessage({ text })
            }}
            onStop={stop}
          />
          <p className="text-center text-xs text-muted-foreground">
            Assistant dapat membuat kesalahan. Periksa kembali informasi
            penting.
          </p>
        </div>
      </div>
    </div>
  )
}
