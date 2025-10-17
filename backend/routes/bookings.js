// backend/routes/bookings.js
import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middlewares/auth.js'

const router = express.Router()

// =============================
// GET /api/bookings?date=YYYY-MM-DD
// ดึงรายการจองของวันนั้น พร้อมฟิลด์เวลาแบบ HH:MM (start_hhmm/end_hhmm)
// เพื่อตัดปัญหา timezone ทางฝั่ง frontend
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

/*  หมายเหตุ:
    ถ้าฐานข้อมูลเก็บเวลาเป็น UTC ให้เปลี่ยน 2 บรรทัด TIME_FORMAT เป็น:
    TIME_FORMAT(CONVERT_TZ(b.start_at,'+00:00','+07:00'),'%H:%i') และแบบเดียวกันกับ end_at
*/

// ===== helper สำหรับ POST =====
const sanitizeId = (s) => String(s || '').replace(/\s+/g, '').trim()
const validStudentId = (id) => /^\d{8,10}$/.test(id) // ปรับรูปแบบตามจริงได้

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
    // ส่งข้อความจาก SIGNAL/ข้อผิดพลาด DB ออกมาให้อ่านง่าย
    const msg = e?.sqlMessage || e?.message || 'server error'
    return res.status(400).json({ ok: false, message: msg })
  }
})

export default router
