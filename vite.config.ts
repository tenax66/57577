import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: true,
    outDir: './pages',
  },
  css: {
    preprocessorOptions: {
       sass: {
       api: "modern-compiler",
       },
    },
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
  plugins: [react()],
  assetsInclude: ['**/*.md'],
})
