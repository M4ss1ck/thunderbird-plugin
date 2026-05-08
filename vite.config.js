import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export const createViteConfig = ({ mode }) => {
    const isExtensionBuild = mode === 'extension'

    return {
        plugins: [react(), nodePolyfills()],
        optimizeDeps: {
            entries: ['index.html'],
        },
        build: isExtensionBuild
            ? {
                  outDir: 'dist',
                  lib: {
                      entry: ['src/index.jsx', 'src/background.js'],
                      formats: ['es'],
                  },
                  rollupOptions: {
                      external: ['static'],
                  },
              }
            : {
                  outDir: 'dist-preview',
              },
    }
}

export default defineConfig(createViteConfig)
