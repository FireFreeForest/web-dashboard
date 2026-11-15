import type { User, UserRole } from "@/features/auth/types"

export const USER_ROLES: UserRole[] = ["admin", "petugas", "viewer"]

export type ListUsersParams = {
  page: number
  perPage: number
}

export type ListUsersResult = {
  data: User[]
  meta: {
    page: number
    per_page: number
    total: number
  }
}

export type CreateUserInput = {
  email: string
  password: string
  name: string
  role: UserRole
}

export type UpdateUserInput = {
  id: string
  name?: string
  role?: UserRole
  is_active?: boolean
  password?: string
}

export type { User, UserRole }
