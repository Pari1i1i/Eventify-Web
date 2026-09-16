import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://photograph-revision-tell-lynn.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

