// src/plugins/axios.js
import axios from 'axios'
import { useAuthStore } from '@/store/auth'   // ✅ แนบ token ได้

// ใช้ env ถ้ามี; ถ้าไม่ได้ตั้ง env ให้ fallback เป็น '/api' (ใช้ proxy ได้)
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const api = axios.create({
  baseURL: BASE ? `${BASE}/api` : '/api',
  // ถ้าใช้ cookie-based session ให้เปลี่ยนเป็น true และตั้ง CORS ให้รับ credentials
  withCredentials: false
})

// ✅ แนบ Authorization: Bearer <token> อัตโนมัติ
api.interceptors.request.use((config) => {
  try {
    const auth = useAuthStore()
    if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
  } catch {}
  return config
})

// Log error ให้เห็นง่าย ๆ
api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error('[API ERROR]', err?.response?.data || err.message)
    return Promise.reject(err)
  }
)

export default api
