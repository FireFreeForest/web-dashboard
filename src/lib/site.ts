export const SITE_NAME = "Fire Free Forest"

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "http://localhost:5173"
).replace(/\/+$/, "")

export const SITE_DESCRIPTION =
  "Dasbor pemantauan hutan berbasis IoT: pantau device, telemetri suhu, kelembapan, asap, dan status pompa air secara real-time untuk deteksi dini kebakaran hutan."

export const SITE_TITLE = `${SITE_NAME} - Dashboard`

export const OG_IMAGE = `${SITE_URL}/og.png`

export function pageTitle(page: string) {
  return `${page} - ${SITE_NAME}`
}
