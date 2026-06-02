import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/interactive-network-lab/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
