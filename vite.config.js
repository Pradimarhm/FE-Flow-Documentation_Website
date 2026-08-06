import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  esbuild: {
    // Menghapus console.log dan console.info HANYA saat build production
    // console.error dan console.warn TETAP ADA untuk monitoring error fatal
    pure: process.env.NODE_ENV === 'production' 
      ? ['console.log', 'console.info'] 
      : [],
  },
})
