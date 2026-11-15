export { cn } from "cn"

export function toOptionalNumber(
  value: FormDataEntryValue | null
): number | undefined {
  if (value === null) {
    return undefined
  }

  const text = String(value).trim()
  if (text === "") {
    return undefined
  }

  const number = Number(text)
  return Number.isFinite(number) ? number : undefined
}
