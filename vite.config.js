import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: ['src/index.jsx', 'src/background.js'],
            formats: ['es'],
        },
    },
})
