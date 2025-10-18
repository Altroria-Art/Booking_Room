// src/services/api.js
import api from '@/plugins/axios'   // ถ้าไม่ได้ตั้ง alias '@' ให้เปลี่ยนเป็น '../plugins/axios'

export const fetchMyBooking = (params = {}) =>
  api.get('/bookings/my', { params })   // { date, roomCode? }

export const fetchMyBookingToday = (date) =>
  api.get('/bookings/my', { params: { date } })

export const fetchMyLatestBooking = () =>
  api.get('/bookings/my-latest')   // ใช้ token จาก axios interceptor

export const cancelBooking = (bookingId) =>
  api.delete(`/bookings/${bookingId}`)
/* ---------- Reviews (ผู้ใช้) ---------- */
// ผู้ใช้ดึงรีวิวตามห้อง/แบ่งหน้า
export const fetchReviews = (params = {}) =>
  api.get('/reviews', { params })       // { page, pageSize, room_id }

// ผู้ใช้สร้างรีวิว
export const createReview = (payload) =>
  api.post('/reviews', payload)         // { rating, comment, created_by, room_id? }

/* ---------- Admin: Reviews ---------- */
// แอดมินดึงรีวิวทั้งหมด (รองรับกรองตามดาว)
export const getAdminReviews = (params = {}) =>
  api.get('/reviews/admin', { params }) // { page, pageSize, room_id?, rating? }

// แอดมินดึงสรุปจำนวนรีวิวแยกตามดาว (ไว้ทำ chips)
export const getAdminReviewSummary = (params = {}) =>
  api.get('/reviews/admin/summary', { params }) // { room_id? }

// แอดมินลบรีวิวตาม id
export const deleteAdminReview = (id) =>
  api.delete(`/reviews/admin/${id}`)

// alias เผื่อชอบชื่อแบบ fetch*
export const fetchAdminReviews = getAdminReviews

/* ---------- Rooms (แก้ไข/ลบ) ---------- */
export const getRooms = (params = {}) =>
  api.get('/rooms', { params })

export const getRoomTypes = () =>
  api.get('/room-types')

export const createRoom = (payload) => 
  api.post('/rooms', payload)

export const updateRoom = (id, payload) =>
  api.put(`/rooms/${id}`, payload)       // { room_code, room_type_id }

export const deleteRoom = (id) =>
  api.delete(`/rooms/${id}`)

// alias
export const fetchRooms = getRooms
export const fetchRoomTypes = getRoomTypes

// helper กรองตามประเภท
export const getRoomsByType = (typeId) => getRooms({ typeId })
