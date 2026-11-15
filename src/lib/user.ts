export type User = {
  name: string
  email: string
  avatar: string
}

export const currentUser: User = {
  name: "Forest Admin",
  email: "admin@firefreeforest.id",
  avatar: "",
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
