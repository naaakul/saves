import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteStaticCopy } from "vite-plugin-static-copy"

export default defineConfig({
  base: "./", // ← THIS FIXES ERR_FILE_NOT_FOUND
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: "."
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
        background: "src/background.ts"
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
})
