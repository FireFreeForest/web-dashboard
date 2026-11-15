import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import { authKeys } from "@/features/auth/queries"

import { userKeys } from "./queries"
import type { CreateUserInput, UpdateUserInput, User } from "./types"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, ApiError, CreateUserInput>({
    mutationFn: (input) =>
      apiFetch<User>({
        method: "POST",
        url: "/users",
        data: input,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, ApiError, UpdateUserInput>({
    mutationFn: ({ id, ...body }) => {
      const data: Record<string, unknown> = {}

      if (body.name !== undefined) {
        data.name = body.name
      }
      if (body.role !== undefined) {
        data.role = body.role
      }
      if (body.is_active !== undefined) {
        data.is_active = body.is_active
      }
      if (body.password) {
        data.password = body.password
      }

      return apiFetch<User>({
        method: "PATCH",
        url: `/users/${id}`,
        data,
      })
    },
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all })

      const currentUser = queryClient.getQueryData<User>(authKeys.me())

      if (currentUser?.id === user.id) {
        queryClient.setQueryData(authKeys.me(), user)
      }
    },
  })
}
