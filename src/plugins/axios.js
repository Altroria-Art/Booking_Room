// src/plugins/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: false
})

api.interceptors.response.use(
  r => r,
  err => {
    console.error('[API ERROR]', err?.response?.data || err.message)
    return Promise.reject(err)
  }
)

export default api
