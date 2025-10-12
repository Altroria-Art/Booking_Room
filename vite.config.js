// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // ทุกคำขอที่ขึ้นต้น /api จะถูกส่งต่อไป backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // ถ้า backend มี path prefix อื่น ค่อยใช้ rewrite
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
