import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',

  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
    },
    commonjsOptions: {
      esmExternals: true,
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/firestore'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
