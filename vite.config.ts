import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Vite configuration for the MCP Marketplace project
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

