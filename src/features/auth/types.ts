export type UserRole = "admin" | "petugas" | "viewer"

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TokenPair = {
  access_token: string
  refresh_token: string
  token_type: "Bearer"
  access_expires_at: string
  refresh_expires_at: string
}

export type LoginInput = {
  email: string
  password: string
}

export type LoginResult = {
  tokens: TokenPair
  user: User
}
