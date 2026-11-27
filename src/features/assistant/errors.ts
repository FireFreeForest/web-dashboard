import { MastraClientError } from "@mastra/client-js"

export function assistantErrorMessage(error: unknown): string {
  if (error instanceof MastraClientError) {
    if (error.status === 401) {
      return "Sesi berakhir. Silakan login ulang."
    }
    if (error.status === 403) {
      return "Anda tidak memiliki akses ke percakapan ini."
    }
    if (error.status === 404) {
      return "Percakapan tidak ditemukan."
    }
    if (error.status === 429) {
      return "Terlalu banyak permintaan. Coba lagi sebentar."
    }
    if (error.status >= 500) {
      return "Assistant sedang tidak tersedia."
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Gagal memproses permintaan assistant."
}
