import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useUpdateUser } from "@/features/users/mutations"
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from "@/features/users/schema"
import {
  USER_ROLES,
  type UpdateUserInput,
  type User,
  type UserRole,
} from "@/features/users/types"
import { ApiError } from "@/lib/api/types"

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  petugas: "Petugas",
  viewer: "Viewer",
}

type FieldErrors = Partial<Record<keyof UpdateUserFormValues, string>>

function toFieldErrors(error: ApiError): FieldErrors {
  switch (error.code) {
    case "invalid_request":
      return { name: error.message }
    default:
      return {}
  }
}

function EditUserForm({
  user,
  isSelf,
  onClose,
}: {
  user: User
  isSelf: boolean
  onClose: () => void
}) {
  const updateUser = useUpdateUser()
  const [name, setName] = React.useState(user.name)
  const [role, setRole] = React.useState<UserRole>(user.role)
  const [isActive, setIsActive] = React.useState(user.is_active)
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [formError, setFormError] = React.useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsed = updateUserSchema.safeParse({
      name,
      role,
      is_active: isActive,
      password: password.length > 0 ? password : undefined,
    })

    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof UpdateUserFormValues
        nextErrors[key] ??= issue.message
      }
      setErrors(nextErrors)
      return
    }

    setErrors({})

    const input: UpdateUserInput = { id: user.id }

    if (parsed.data.name !== user.name) {
      input.name = parsed.data.name
    }
    if (parsed.data.role !== undefined && parsed.data.role !== user.role) {
      input.role = parsed.data.role
    }
    if (
      parsed.data.is_active !== undefined &&
      parsed.data.is_active !== user.is_active
    ) {
      input.is_active = parsed.data.is_active
    }
    if (parsed.data.password) {
      input.password = parsed.data.password
    }

    if (
      input.name === undefined &&
      input.role === undefined &&
      input.is_active === undefined &&
      input.password === undefined
    ) {
      setFormError("Tidak ada perubahan untuk disimpan.")
      return
    }

    try {
      await updateUser.mutateAsync(input)
      toast.success("User berhasil diperbarui.")
      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "not_found") {
          toast.error("User tidak ditemukan. Daftar akan diperbarui.")
          onClose()
          return
        }

        setErrors(toFieldErrors(error))

        if (error.code !== "invalid_request") {
          setFormError(
            error.code === "forbidden"
              ? "Anda tidak memiliki akses untuk mengubah user."
              : error.message
          )
        }
        return
      }
      setFormError("Terjadi kesalahan tidak terduga.")
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="edit-user-email">Email</FieldLabel>
          <Input id="edit-user-email" value={user.email} disabled readOnly />
          <FieldDescription>Email tidak dapat diubah.</FieldDescription>
        </Field>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="edit-user-name">Name</FieldLabel>
          <Input
            id="edit-user-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            disabled={updateUser.isPending}
          />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.role)}>
          <FieldLabel htmlFor="edit-user-role">Role</FieldLabel>
          <Select
            value={role}
            onValueChange={(value) => setRole(value as UserRole)}
            disabled={updateUser.isPending || isSelf}
          >
            <SelectTrigger id="edit-user-role" className="w-full">
              <SelectValue>
                {(value) =>
                  ROLE_LABEL[(value as UserRole) ?? "viewer"] ?? "Viewer"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map((option) => (
                <SelectItem key={option} value={option}>
                  {ROLE_LABEL[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSelf ? (
            <FieldDescription>
              Role akun sendiri tidak dapat diubah.
            </FieldDescription>
          ) : null}
          <FieldError>{errors.role}</FieldError>
        </Field>
        <Field
          orientation="horizontal"
          data-invalid={Boolean(errors.is_active)}
        >
          <FieldContent>
            <FieldLabel htmlFor="edit-user-active">Aktif</FieldLabel>
            {isSelf ? (
              <FieldDescription>
                Status akun sendiri tidak dapat diubah.
              </FieldDescription>
            ) : null}
            <FieldError>{errors.is_active}</FieldError>
          </FieldContent>
          <Switch
            id="edit-user-active"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={updateUser.isPending || isSelf}
          />
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="edit-user-password">Password baru</FieldLabel>
          <Input
            id="edit-user-password"
            type="text"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            disabled={updateUser.isPending}
          />
          <FieldDescription>
            Kosongkan bila tidak ingin mengubah password.
          </FieldDescription>
          <FieldError>{errors.password}</FieldError>
        </Field>
        {formError ? <FieldError>{formError}</FieldError> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateUser.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateUser.isPending}>
            {updateUser.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  )
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  isSelf,
}: {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isSelf: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Perubahan role berlaku setelah user login atau refresh token.
          </DialogDescription>
        </DialogHeader>
        {user ? (
          <EditUserForm
            key={user.id}
            user={user}
            isSelf={isSelf}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
