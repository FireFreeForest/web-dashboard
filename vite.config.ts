import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const FALLBACK_SITE_URL = "http://localhost:5173"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const siteUrl = (
    env.VITE_SITE_URL ||
    process.env.VITE_SITE_URL ||
    FALLBACK_SITE_URL
  ).replace(/\/+$/, "")

  return {
    plugins: [
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      {
        name: "html-site-url-fallback",
        transformIndexHtml: {
          order: "pre",
          handler: (html) => html.replaceAll("%VITE_SITE_URL%", siteUrl),
        },
      },
    ],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "./src"),
      },
    },
  }
})
