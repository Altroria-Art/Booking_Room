// src/services/api.js
import api from '@/plugins/axios'   // ถ้าไม่ได้ตั้ง alias '@' ให้เปลี่ยนเป็น '../plugins/axios'

/* ========= helpers กันแคช ========= */
const stamp = (params = {}) => ({ ...params, _: Date.now() }) // แนบ time-stamp ทุกครั้ง
const noStore = { headers: { 'Cache-Control': 'no-store', 'Pragma': 'no-cache' } }

/* ---------- Bookings (ของผู้ใช้) ---------- */
// ใช้ใน "หลักฐานการจอง" → ต้องกันแคชเสมอ
export const fetchMyBooking = (params = {}) =>
  api.get('/bookings/my', { params: stamp(params), ...noStore })   // { date, roomCode? }

export const fetchMyBookingToday = (date) =>
  api.get('/bookings/my', { params: stamp({ date }), ...noStore })

// ใช้ดึงรายการล่าสุด (กันแคชไว้ด้วยกันพลาด)
export const fetchMyLatestBooking = () =>
  api.get('/bookings/my-latest', { params: stamp(), ...noStore })

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
export const getAdminReviews = (params = {}) =>
  api.get('/reviews/admin', { params }) // { page, pageSize, room_id?, rating? }

export const getAdminReviewSummary = (params = {}) =>
  api.get('/reviews/admin/summary', { params }) //
