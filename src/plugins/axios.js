// src/plugins/axios.js
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

/**
 * baseURL rules:
 * - ถ้าไม่ตั้ง VITE_API_BASE → ใช้ '/api' (เหมาะกับ dev proxy)
 * - ถ้าตั้งเป็น URL เต็ม เช่น 'http://localhost:3000/api' → ใช้ตามนั้น
 * - ถ้าตั้งเป็น host เช่น 'http://localhost:3000' → จะเติม '/api' ให้เอง
 * - ถ้าตั้งเป็น path เช่น '/backend' → จะได้ '/backend/api'
 * - ถ้าตั้งเป็น '/api' อยู่แล้ว → ไม่เติมซ้ำ
 */
function resolveBaseURL() {
  let raw = (import.meta.env.VITE_API_BASE || '').trim()

  // ตัด slash ท้าย (ยกเว้นกรณีเป็นแค่ "/")
  if (raw.length > 1) raw = raw.replace(/\/+$/, '')

  if (!raw) return '/api'

  // ถ้าเป็น URL เต็ม
  if (/^https?:\/\//i.test(raw)) {
    return raw.endsWith('/api') ? raw : `${raw}/api`
  }

  // ถ้าเป็น path ภายในโปรเจกต์
  if (raw === '/' || raw === '/api' || raw.endsWith('/api')) return raw
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
  } catch {
    /* Pinia ยังไม่พร้อม */
  }

  if (!token) token = localStorage.getItem('token')
  if (!token && import.meta.env.VITE_DEV_TOKEN) {
    // ใช้ DEV TOKEN ได้ถ้า backend เปิด ALLOW_DEV_TOKEN
    token = import.meta.env.VITE_DEV_TOKEN
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }
  headers.Accept = headers.Accept || 'application/json'
  headers['X-Requested-With'] = headers['X-Requested-With'] || 'XMLHttpRequest'
  return config
})

// log error ให้อ่านง่าย
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const { status, data } = err?.response || {}
    console.error('[API ERROR]', status, data || err.message)
    return Promise.reject(err)
  }
)

export default api
