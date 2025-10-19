// src/services/api.js
// NOTE: ถ้าโปรเจกต์ไม่ได้ตั้ง alias '@' ให้เปลี่ยนเป็น '../plugins/axios'
import api from '@/plugins/axios'

/* ========= helpers กันแคช ========= */
export const stamp   = (params = {}) => ({ ...params, _: Date.now() }) // แนบ time-stamp ทุกครั้ง
export const noStore = { headers: { 'Cache-Control': 'no-store', 'Pragma': 'no-cache' } }

/* ===================================
 * ROOM TYPES
 * ===================================*/
export const fetchRoomTypes     = (params = {}) => api.get('/room-types', { params })
export const createRoomType     = (payload)      => api.post('/room-types', payload)
export const updateRoomType     = (id, payload)  => api.put(`/room-types/${id}`, payload)
export const deleteRoomType     = (id)           => api.delete(`/room-types/${id}`)

/* ===================================
 * ROOMS
 * ===================================*/
export const fetchRooms         = (params = {}) => api.get('/rooms', { params })
export const createRoom         = (payload)      => api.post('/rooms', payload)
export const updateRoom         = (id, payload)  => api.put(`/rooms/${id}`, payload)
export const deleteRoom         = (id)           => api.delete(`/rooms/${id}`)
// (เผื่อมี endpoint เปิด/ปิดห้องแบบเร็ว)
export const toggleRoomActive   = (id, active)   => api.patch(`/rooms/${id}/active`, { active })

/* ===================================
 * BOOKINGS (ผู้ใช้ทั่วไป)
 * ===================================*/
// ใช้ใน "หลักฐานการจอง" → ต้องกันแคชเสมอ
export const fetchMyBooking       = (params = {}) =>
  api.get('/bookings/my', { params: stamp(params), ...noStore })   // { date, roomCode? }

export const fetchMyBookingToday  = (date) =>
  api.get('/bookings/my', { params: stamp({ date }), ...noStore })

// ใช้ดึงรายการล่าสุด (กันแคชไว้ด้วยกันพลาด)
export const fetchMyLatestBooking = () =>
  api.get('/bookings/my-latest', { params: stamp(), ...noStore })

export const cancelBooking        = (bookingId) =>
  api.delete(`/bookings/${bookingId}`) // ผู้ใช้ยกเลิกของตัวเอง

// generic booking (เผื่อหน้าอื่นใช้)
export const fetchBookings        = (params = {}) => api.get('/bookings', { params })
export const createBooking        = (payload)      => api.post('/bookings', payload)

/* ===================================
 * REVIEWS (ผู้ใช้)
 * ===================================*/
export const fetchReviews         = (params = {}) => api.get('/reviews', { params }) // { page, pageSize, room_id }
export const createReview         = (payload)      => api.post('/reviews', payload)   // { rating, comment, created_by, room_id? }

/* ===================================
 * ADMIN: Reviews / Bookings
 * ===================================*/
export const getAdminReviews        = (params = {}) => api.get('/reviews/admin', { params })           // { page, pageSize, room_id?, rating? }
export const getAdminReviewSummary  = (params = {}) => api.get('/reviews/admin/summary', { params })
export const deleteAdminReview      = (id)            => api.delete(`/reviews/admin/${id}`)

// ✅ รายการจองของวัน (กันแคช + no-store) — คืน .data ให้เลย
export const getAdminBookings       = (params = {}) =>
  api.get('/bookings/admin', { params: stamp(params), ...noStore }).then(r => r.data)

// ✅ ใช้กับป๊อปอัพยกเลิกการจอง (แอดมิน) — คืน .data ให้เลย
export const getAdminBooking        = (id) =>
  api.get(`/bookings/admin/${id}`, { params: stamp(), ...noStore }).then(r => r.data)

export const cancelAdminBooking     = (id) =>
  api.delete(`/bookings/admin/${id}`).then(r => r.data)

/* ========= Convenience helpers (คงชื่อเดิมไว้) ========= */
export const getAdminBookingsData = (params = {}) => getAdminBookings(params)
export const getAdminBookingData  = (id) => getAdminBooking(id)

/* ===================================
 * default export (เผื่อบางไฟล์ import แบบ default)
 * ===================================*/
export default {
  // helpers
  stamp, noStore,

  // room types
  fetchRoomTypes, createRoomType, updateRoomType, deleteRoomType,

  // rooms
  fetchRooms, createRoom, updateRoom, deleteRoom, toggleRoomActive,

  // bookings (ผู้ใช้)
  fetchMyBooking, fetchMyBookingToday, fetchMyLatestBooking, cancelBooking,
  fetchBookings, createBooking,

  // reviews (ผู้ใช้)
  fetchReviews, createReview,

  // admin
  getAdminReviews, getAdminReviewSummary, deleteAdminReview,
  getAdminBookings, getAdminBooking, cancelAdminBooking,

  // helpers ที่คืน .data
  getAdminBookingsData, getAdminBookingData,
}
