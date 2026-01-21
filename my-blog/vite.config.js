import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  base: '/',

  plugins: [
    react(),
    nodePolyfills({
      // needed to run node crypto library in browser
      protocolImports: true,
    }),
  ],
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
    port: 5173,
    allowedHosts: ['mardell-apish-colourlessly.ngrok-free.dev'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
  }
})
