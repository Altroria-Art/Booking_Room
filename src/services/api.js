// src/services/api.js
import api from '@/plugins/axios'   // ถ้าไม่ได้ตั้ง alias '@' ให้เปลี่ยนเป็น '../plugins/axios'

export const getMyActiveBooking = () =>
  api.get('/bookings/me/active').then(r => r)

export const cancelMyBooking = (bookingId) =>
  api.delete(`/bookings/${bookingId}`).then(r => r)
/* ---------- Reviews (ของเดิม) ---------- */
export const fetchReviews = (params = {}) =>
  api.get('/reviews', { params })       // { page, pageSize, room_id }

export const createReview = (payload) =>
  api.post('/reviews', payload)          // { rating, comment, created_by, room_id? }

/* ---------- Rooms (เพิ่มใหม่สำหรับปุ่มแก้ไข/ลบ) ---------- */
export const getRooms = (params = {}) =>
  api.get('/rooms', { params })          // เผื่อมี filter/query

export const getRoomTypes = () =>
  api.get('/room-types')

export const createRoom = (payload) => 
  api.post('/rooms', payload)

export const updateRoom = (id, payload) =>
  api.put(`/rooms/${id}`, payload)       // { room_code, room_type_id }

export const deleteRoom = (id) =>
  api.delete(`/rooms/${id}`)

// (ถ้าชอบตั้งชื่อแบบ fetch*)
export const fetchRooms = getRooms
export const fetchRoomTypes = getRoomTypes

// (ทางเลือก) helper กรองตามประเภท
export const getRoomsByType = (typeId) => getRooms({ typeId })