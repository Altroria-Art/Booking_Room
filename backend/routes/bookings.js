// booking-api/routes/bookings.js
import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middlewares/auth.js'

const router = express.Router()

// สร้างการจองด้วย Stored Procedure: CreateBooking
router.post('/', requireAuth, async (req, res) => {
  try {
    const { roomCode, startAt, endAt, members } = req.body
    if (!roomCode || !startAt || !endAt || !Array.isArray(members)) {
      return res.status(400).json({ message: 'invalid payload' })
    }

    // ใช้ student_id ของผู้ล็อกอินเป็น created_by (ตรงสคีมาปัจจุบัน)
    const createdBy = req.user.student_id
    if (!createdBy) {
      return res.status(400).json({ message: 'your account has no student_id' })
    }

    // CALL CreateBooking(room_code, start_at, end_at, created_by, members_json)
    await pool.query(
      'CALL CreateBooking(?, ?, ?, ?, ?)',
      [roomCode, startAt, endAt, createdBy, JSON.stringify(members)]
    )

    return res.json({ ok: true })
  } catch (e) {
    // forward message จาก SIGNAL ใน SP ออกมาอ่านง่าย
    const msg = e?.sqlMessage || e?.message || 'server error'
    return res.status(400).json({ ok: false, message: msg })
  }
})

export default router
