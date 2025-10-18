// src/plugins/axios.js
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

/**
 * baseURL rules:
 * - ถ้าไม่ตั้ง VITE_API_BASE → ใช้ '/api' (เหมาะกับ dev proxy)
 * - ถ้าตั้งเป็น URL เต็ม เช่น 'http://localhost:3000/api' → ใช้ตามนั้น
 * - ถ้าตั้งเป็นแค่ host เช่น 'http://localhost:3000' → จะเติม '/api' ให้เอง
 */
function resolveBaseURL() {
  const raw = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '')
  if (!raw) return '/api'
  if (/^https?:\/\//i.test(raw)) {
    // เป็น URL เต็ม: ถ้าไม่มี /api ต่อท้าย ให้เติมให้
    return raw.endsWith('/api') ? raw : `${raw}/api`
  }
  // เป็น path ภายใน เช่น '/backend' → เติม /api ต่อท้าย
  return `${raw}/api`
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: false, // ใช้ Bearer token; ไม่พกคุกกี้
  // timeout: 15000,
})

// แนบ Authorization อัตโนมัติ (Pinia -> localStorage -> VITE_DEV_TOKEN)
api.interceptors.request.use((config) => {
  const headers = (config.headers ||= {})
  let token

  try {
    const auth = useAuthStore()
    token = auth?.token
  } catch { /* Pinia ยังไม่พร้อม */ }

  if (!token) token = localStorage.getItem('token')
  if (!token && import.meta.env.VITE_DEV_TOKEN) {
    token = import.meta.env.VITE_DEV_TOKEN // ใช้ร่วมกับ ALLOW_DEV_TOKEN=1 ฝั่ง backend
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }
  headers.Accept = headers.Accept || 'application/json'
  return config
})

// Log error ให้อ่านง่าย (เลือกเด้งออกเมื่อ 401 ได้)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const { status, data } = err?.response || {}
    console.error('[API ERROR]', status, data || err.message)

    // ถ้าต้องการ auto logout เมื่อ 401:
    // if (status === 401) {
    //   try { useAuthStore().$reset() } catch {}
    //   localStorage.removeItem('token')
    //   // location.href = '/login'
    // }

    return Promise.reject(err)
  }
)

export default api
