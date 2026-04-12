import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  server: {
    proxy: {
      '/rpc/mainnet': {
        target: 'https://public-node.rsk.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc\/mainnet/, ''),
      },
      '/rpc/testnet': {
        target: 'https://public-node.testnet.rsk.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc\/testnet/, ''),
      },
      '/api/blockscout/mainnet': {
        target: 'https://rootstock.blockscout.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/blockscout\/mainnet/, '/api'),
      },
      '/api/blockscout/testnet': {
        target: 'https://rootstock-testnet.blockscout.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/blockscout\/testnet/, '/api'),
      },
    },
  },
})
