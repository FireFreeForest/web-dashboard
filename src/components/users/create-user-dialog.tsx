import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
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
import { useCreateUser } from "@/features/users/mutations"
import {
  createUserSchema,
  type CreateUserFormValues,
} from "@/features/users/schema"
import {
  USER_ROLES,
  type CreateUserInput,
  type UserRole,
} from "@/features/users/types"
import { ApiError } from "@/lib/api/types"

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  petugas: "Petugas",
  viewer: "Viewer",
}

type FieldErrors = Partial<Record<keyof CreateUserFormValues, string>>

function toFieldErrors(error: ApiError): FieldErrors {
  switch (error.code) {
    case "duplicate_email":
      return { email: "Email sudah terdaftar." }
    case "invalid_request":
      return { email: error.message }
    default:
      return {}
  }
}

function isFieldError(error: ApiError): boolean {
  return error.code === "duplicate_email" || error.code === "invalid_request"
}

export function CreateUserDialog() {
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [name, setName] = React.useState("")
  const [role, setRole] = React.useState<UserRole>("viewer")
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [formError, setFormError] = React.useState<string | null>(null)

  const createUser = useCreateUser()

  const reset = () => {
    setEmail("")
    setPassword("")
    setName("")
    setRole("viewer")
    setErrors({})
    setFormError(null)
    createUser.reset()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      reset()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsed = createUserSchema.safeParse({ email, password, name, role })

    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CreateUserFormValues
        nextErrors[key] ??= issue.message
      }
      setErrors(nextErrors)
      return
    }

    setErrors({})

    const input: CreateUserInput = parsed.data

    try {
      await createUser.mutateAsync(input)
      toast.success("User berhasil ditambahkan.")
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(toFieldErrors(error))
        if (!isFieldError(error)) {
          setFormError(error.message)
        }
        return
      }
      setFormError("Terjadi kesalahan tidak terduga.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button onClick={() => setOpen(true)}>
        <HugeiconsIcon
          icon={Add01Icon}
          data-icon="inline-start"
          strokeWidth={2}
        />
        Add user
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Buat akun baru. User langsung aktif setelah dibuat.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="create-user-name">Name</FieldLabel>
              <Input
                id="create-user-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(errors.name)}
                disabled={createUser.isPending}
              />
              <FieldError>{errors.name}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
              <Input
                id="create-user-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                disabled={createUser.isPending}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="create-user-password">Password</FieldLabel>
              <Input
                id="create-user-password"
                type="text"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(errors.password)}
                disabled={createUser.isPending}
              />
              <FieldError>{errors.password}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.role)}>
              <FieldLabel htmlFor="create-user-role">Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                disabled={createUser.isPending}
              >
                <SelectTrigger id="create-user-role" className="w-full">
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
              <FieldError>{errors.role}</FieldError>
            </Field>
            {formError ? <FieldError>{formError}</FieldError> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createUser.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Saving..." : "Create user"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
