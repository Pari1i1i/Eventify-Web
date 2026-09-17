import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://photographic-more-clearly-essays.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

