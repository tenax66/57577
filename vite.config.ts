import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: true,
    outDir: './pages',
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
  plugins: [react()],
})
