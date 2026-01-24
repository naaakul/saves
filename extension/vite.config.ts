import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteStaticCopy } from "vite-plugin-static-copy"
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: "."
        },
        {
          src: 'icons',
          dest: '.'
        }
      ]
    }),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: "popup.html",
        background: "src/background.ts"
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
})
