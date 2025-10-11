import axios from 'axios'
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

export const fetchBookingsOfDay = (date /* 'YYYY-MM-DD' */) =>
  api.get('/bookings', { params: { date } })

export const fetchRooms = () => api.get('/rooms')
