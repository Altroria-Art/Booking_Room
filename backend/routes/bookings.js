// backend/routes/bookings.js
import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middlewares/auth.js'

const router = express.Router()

// =============================
// GET /api/bookings?date=YYYY-MM-DD
// ดึงรายการจองของวันนั้น พร้อมฟิลด์เวลาแบบ HH:MM (start_hhmm/end_hhmm)
// =============================
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10)

    const [rows] = await pool.query(
      `SELECT
         b.id, b.room_id, r.room_code,
         b.start_at, b.end_at,
         TIME_FORMAT(b.start_at, '%H:%i') AS start_hhmm,
         TIME_FORMAT(b.end_at,   '%H:%i') AS end_hhmm,
         b.created_by,
         COALESCE(u.display_name, '') AS display_name
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       LEFT JOIN users u ON u.student_id = b.created_by
       WHERE DATE(b.start_at) = ?
       ORDER BY r.room_code, b.start_at`,
      [date]
    )

    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'bookings list error' })
  }
})

/* ถ้าฐานข้อมูลเก็บเวลาเป็น UTC:
   เปลี่ยน TIME_FORMAT(b.start_at, ...) เป็น
   TIME_FORMAT(CONVERT_TZ(b.start_at,'+00:00','+07:00'),'%H:%i') (และเช่นเดียวกับ end_at)
*/

// ===== helper สำหรับ POST =====
const sanitizeId = (s) => String(s || '').replace(/\s+/g, '').trim()
const validStudentId = (id) => /^\d{8,10}$/.test(id) // ปรับตามรูปแบบจริงได้

// =============================
// POST /api/bookings
// เรียก Stored Procedure: CreateBooking(room_code, start_at, end_at, created_by, members_json)
// =============================
router.post('/', requireAuth, async (req, res) => {
  try {
    const { roomCode, startAt, endAt, members } = req.body || {}

    if (!roomCode || !startAt || !endAt || !Array.isArray(members)) {
      return res.status(400).json({ message: 'invalid payload' })
    }

    // ใช้ student_id ของผู้ล็อกอินเป็น owner/created_by
    const createdBy = sanitizeId(req.user?.student_id)
    if (!createdBy) {
      return res.status(400).json({ message: 'your account has no student_id' })
    }

    // รวม owner เข้าไปเสมอ + ล้าง/ตัดซ้ำ
    let list = [createdBy, ...members.map(sanitizeId)].filter(Boolean)
    list = Array.from(new Set(list))

    // เช็กจำนวน 5–10 คน (รวมเจ้าของ)
    if (list.length < 5 || list.length > 10) {
      return res.status(400).json({ message: 'จำนวนสมาชิกต้อง 5–10 คน (รวมเจ้าของ)' })
    }

    // เช็กรูปแบบรหัสนิสิตเบื้องต้น
    const bad = list.find((id) => !validStudentId(id))
    if (bad) {
      return res.status(400).json({ message: `รูปแบบรหัสนิสิตไม่ถูกต้อง: ${bad}` })
    }

    // เรียก Stored Procedure
    await pool.query('CALL CreateBooking(?, ?, ?, ?, ?)', [
      roomCode,
      startAt,
      endAt,
      createdBy,
      JSON.stringify(list),
    ])

    return res.status(201).json({ ok: true })
  } catch (e) {
    const msg = e?.sqlMessage || e?.message || 'server error'
    return res.status(400).json({ ok: false, message: msg })
  }
})

// =============================
// NEW: GET /api/bookings/me/active
// ดึงการจองที่ "ยังไม่หมดเวลา" ล่าสุดของผู้ใช้ปัจจุบัน
// =============================
router.get('/me/active', requireAuth, async (req, res) => {
  const sid = req.user.student_id
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.room_id, r.room_code, b.start_at, b.end_at, rt.type_name
       FROM bookings b
       JOIN rooms r      ON r.id = b.room_id
       JOIN room_types rt ON rt.id = r.room_type_id
       WHERE b.created_by = ?
         AND b.end_at >= UTC_TIMESTAMP()   -- ถ้าเก็บเวลาท้องถิ่น ให้เปลี่ยนเป็น NOW()
       ORDER BY b.start_at DESC
       LIMIT 1`,
      [sid]
    )

    if (!rows.length) return res.status(404).json({ message: 'no active booking' })

    const booking = rows[0]
    const [members] = await pool.query(
      `SELECT student_id FROM booking_members WHERE booking_id = ? ORDER BY id ASC`,
      [booking.id]
    )

    return res.json({
      id: booking.id,
      room_id: booking.room_id,
      room_code: booking.room_code,
      start_at: booking.start_at,
      end_at: booking.end_at,
      room_type_name: booking.type_name,
      members: members.map(m => m.student_id),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'failed to get booking' })
  }
})

// =============================
// NEW: DELETE /api/bookings/:id
// ยกเลิก/ลบการจองของตัวเอง (FK CASCADE จะลบ booking_members ให้อัตโนมัติ)
// =============================
router.delete('/:id', requireAuth, async (req, res) => {
  const sid = req.user.student_id
  const id = req.params.id
  try {
    const [result] = await pool.query(
      `DELETE FROM bookings WHERE id = ? AND created_by = ?`,
      [id, sid]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'booking not found' })
    }
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'failed to cancel booking' })
  }
})

export default router
