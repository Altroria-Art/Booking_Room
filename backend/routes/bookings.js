// backend/routes/bookings.js
import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middlewares/auth.js'

const router = express.Router()

// helper เล็กน้อย
const sanitizeId = s => String(s || '').replace(/\s+/g, '').trim()
const validStudentId = id => /^\d{8,10}$/.test(id) // ปรับรูปแบบตามจริงได้

// POST /api/bookings — เรียก SP: CreateBooking
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
    const bad = list.find(id => !validStudentId(id))
    if (bad) {
      return res.status(400).json({ message: `รูปแบบรหัสนิสิตไม่ถูกต้อง: ${bad}` })
    }

    // เรียก Stored Procedure
    // CreateBooking(room_code, start_at, end_at, created_by, members_json)
    await pool.query(
      'CALL CreateBooking(?, ?, ?, ?, ?)',
      [roomCode, startAt, endAt, createdBy, JSON.stringify(list)]
    )

    return res.status(201).json({ ok: true })
  } catch (e) {
    // ส่งข้อความจาก SIGNAL/ข้อผิดพลาด DB ออกมาให้อ่านง่าย
    const msg = e?.sqlMessage || e?.message || 'server error'
    return res.status(400).json({ ok: false, message: msg })
  }
})

export default router
