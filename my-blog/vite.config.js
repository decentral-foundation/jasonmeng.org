import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const tunnelHost = 'mardell-apish-colourlessly.ngrok-free.dev'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  // PUBLIC_CHAIN and PUBLIC_RECEIVING_ADDRESS are shared with the /api
  // functions and are safe to ship to the browser. Never give a secret
  // a VITE_ or PUBLIC_ prefix: those values are inlined into the bundle.
  envPrefix: ['VITE_', 'PUBLIC_'],

  plugins: [
    react(),
    // Browser-only: under Vitest the api/ tests must use real Node modules.
    !process.env.VITEST && nodePolyfills({
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
    // allow all hosts to avoid dev/preview host-block issues behind ngrok/HTTPS
    allowedHosts: true,
    hmr: {
      host: tunnelHost,
      protocol: 'https',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr: {
      host: tunnelHost,
      protocol: 'https',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
  }
})
