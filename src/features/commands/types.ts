export type CommandAction = "SET_PUMP"

export type CommandStatus =
  "pending" | "sent" | "success" | "failed" | "timeout"

export type CommandOrigin = "manual" | "system"

export type CommandPayload = {
  state: boolean
  duration: number
}

export type Command = {
  id: string
  command_id: string
  device_id: string
  action: CommandAction
  payload: CommandPayload
  origin: CommandOrigin
  status: CommandStatus
  issued_by: string | null
  issued_at: string
  sent_at: string | null
  acked_at: string | null
  ack_message: string
  created_at: string
  updated_at: string
}

export type CommandListParams = {
  page?: number
  per_page?: number
}
