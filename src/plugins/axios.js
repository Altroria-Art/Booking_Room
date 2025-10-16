// // src/plugins/axios.js
// import axios from 'axios'
// import { useAuthStore } from '@/store/auth'   // ✅ แนบ token ได้

// // ใช้ env ถ้ามี; ถ้าไม่ได้ตั้ง env ให้ fallback เป็น '/api' (ใช้ proxy ได้)
// const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
// const api = axios.create({
//   baseURL: BASE ? `${BASE}/api` : '/api',
//   // ถ้าใช้ cookie-based session ให้เปลี่ยนเป็น true และตั้ง CORS ให้รับ credentials
//   withCredentials: false
// })

// // ✅ แนบ Authorization: Bearer <token> อัตโนมัติ
// api.interceptors.request.use((config) => {
//   try {
//     const auth = useAuthStore()
//     if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
//   } catch {}
//   return config
// })

// // Log error ให้เห็นง่าย ๆ
// api.interceptors.response.use(
//   (r) => r,
//   (err) => {
//     console.error('[API ERROR]', err?.response?.data || err.message)
//     return Promise.reject(err)
//   }
// )

// export default api


// src/plugins/axios.js
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

// ✅ กติกา baseURL:
// - ถ้าตั้ง VITE_API_BASE ให้เป็น URL เต็ม เช่น 'http://localhost:3000/api' → ใช้ค่านั้นเลย
// - ถ้าไม่ตั้ง → fallback เป็น '/api' (กรณี dev ใช้ proxy)
const base =
  (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '') || '/api'

const api = axios.create({
  baseURL: base,        // เช่น 'http://localhost:3000/api' หรือ '/api'
  withCredentials: false, // ใช้ Bearer token → ไม่ต้องพกคุกกี้
  // timeout: 10000,     // (ทางเลือก) กันค้าง
})

// ✅ แนบ Authorization: Bearer <token> อัตโนมัติ
api.interceptors.request.use((config) => {
  try {
    // กรณี Pinia พร้อมแล้ว
    const auth = useAuthStore()
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
      return config
    }
  } catch {
    // ignore
  }
  // กรณี axios ถูก import ก่อน Pinia active → ดึงจาก localStorage แทน
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ✅ log error ให้อ่านง่าย + (ทางเลือก) จัดการ 401
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const data = err?.response?.data
    console.error('[API ERROR]', data || err.message)

    // (ทางเลือก) ถ้าอยากเด้งออกเมื่อ 401:
    // if (err?.response?.status === 401) {
    //   try { useAuthStore().$reset() } catch {}
    //   localStorage.removeItem('token')
    //   // location.href = '/login'
    // }

    return Promise.reject(err)
  }
)

export default api
