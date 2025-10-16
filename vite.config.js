// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // ทุกคำขอที่ขึ้นต้นด้วย /api จะถูก proxy ไป backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // ถ้า backend ไม่ได้ mount ที่ /api (เช่นอยู่ที่ / เฉย ๆ) ค่อยใช้ rewrite:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})