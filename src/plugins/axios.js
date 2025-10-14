// src/plugins/axios.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: 'http://localhost:3000/api' // ชี้ไป backend
})

api.interceptors.request.use((config) => {
  // inject token
  try {
    const auth = useAuthStore()
    if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`
  } catch {}
  return config
})

export default api
