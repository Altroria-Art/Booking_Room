// backend/routes/bookings.js
import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middlewares/auth.js'

const router = express.Router()

// =============================
// GET /api/bookings?date=YYYY-MM-DD[&roomCode=CE08203]
// =============================
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10)
    const roomCode = req.query.roomCode || null

    // กัน cache
    res.set('Cache-Control', 'no-store')

    const params = [date]
    const roomFilter = roomCode ? ' AND r.room_code = ? ' : ''
    if (roomCode) params.push(roomCode)

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
       WHERE DATE(b.start_at) = ? ${roomFilter}
       ORDER BY r.room_code, b.start_at`,
      params
    )

    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'bookings list error' })
  }
})

/* ถ้า DB เก็บเป็น UTC:
   TIME_FORMAT(CONVERT_TZ(b.start_at,'+00:00','+07:00'),'%H:%i')
   และ WHERE DATE(CONVERT_TZ(b.start_at,'+00:00','+07:00')) = ?
*/

// ===== helper =====
const sanitizeId = (s) => String(s || '').replace(/\s+/g, '').trim()
const validStudentId = (id) => /^\d{8,10}$/.test(id)

// ✅ หา conflict เฉพาะ “วันเดียวกัน”
async function findConflictsByRoomCode(roomCode, startAt, endAt) {
  const [rows] = await pool.query(
    `SELECT
       b.id, r.room_code,
       TIME_FORMAT(b.start_at,'%H:%i') AS start_hhmm,
       TIME_FORMAT(b.end_at,'%H:%i')   AS end_hhmm
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     WHERE r.room_code = ?
       AND DATE(b.start_at) = DATE(?)
       AND NOT (b.end_at <= ? OR b.start_at >= ?)
     ORDER BY b.start_at`,
    [roomCode, startAt, startAt, endAt]
  )
  return rows
}

/* ----------------------------------------------
   ฟีเจอร์ "เช็คของฉันวันนี้" (ใช้บนหน้า user เพื่อปิดปุ่มจอง)
   ---------------------------------------------- */
// GET /api/bookings/my?date=YYYY-MM-DD
router.get('/my', requireAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store')

    const date = req.query.date || new Date().toISOString().slice(0, 10)
    const studentId = sanitizeId(req.user?.student_id)
    if (!studentId) return res.status(401).json({ error: 'Unauthenticated' })

    const [rows] = await pool.query(
      `SELECT b.id, r.room_code,
              TIME_FORMAT(b.start_at,'%H:%i') AS start_hhmm,
              TIME_FORMAT(b.end_at,'%H:%i')   AS end_hhmm
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       WHERE b.created_by = ? AND DATE(b.start_at) = ?
       ORDER BY b.start_at
       LIMIT 1`,
      [studentId, date]
    )

    res.json({
      date,
      hasBooking: rows.length > 0,
      booking: rows[0] || null
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error', detail: e.message })
  }
})

// =============================
// POST /api/bookings
// =============================
router.post('/', requireAuth, async (req, res) => {
  try {
    const { roomCode, startAt, endAt, members } = req.body || {}

    if (!roomCode || !startAt || !endAt || !Array.isArray(members)) {
      return res.status(400).json({ message: 'invalid payload' })
    }

    const createdBy = sanitizeId(req.user?.student_id)
    if (!createdBy) {
      return res.status(400).json({ message: 'your account has no student_id' })
    }

    // รวม owner + ล้าง/ตัดซ้ำ
    let list = [createdBy, ...members.map(sanitizeId)].filter(Boolean)
    list = Array.from(new Set(list))

    if (list.length < 5 || list.length > 10) {
      return res.status(400).json({ message: 'จำนวนสมาชิกต้อง 5–10 คน (รวมเจ้าของ)' })
    }

    const bad = list.find((id) => !validStudentId(id))
    if (bad) {
      return res.status(400).json({ message: `รูปแบบรหัสนิสิตไม่ถูกต้อง: ${bad}` })
    }

    // ❗ กันจองซ้ำวันเดียวกันตาม requirement
    const [myDup] = await pool.query(
      `SELECT id FROM bookings
       WHERE created_by = ? AND DATE(start_at) = DATE(?)
       LIMIT 1`,
      [createdBy, startAt]
    )
    if (myDup.length) {
      return res.status(409).json({
        ok: false,
        message: 'วันนี้คุณได้ทำการจองไปแล้ว (1 คนจองได้ 1 ครั้งต่อวัน)'
      })
    }

    // ✅ PRE-CHECK: รายละเอียดช่วงที่ชน (วันเดียวกัน / ห้องเดียวกัน)
    const conflicts = await findConflictsByRoomCode(roomCode, startAt, endAt)
    if (conflicts.length) {
      return res.status(409).json({
        ok: false,
        message: 'ช่วงเวลาที่เลือกชนกับการจองเดิม',
        conflicts,
      })
    }

    // เรียก Stored Procedure ให้ DB เป็นตัวตัดสินรอบสุดท้าย
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
    // ถ้าข้อความจาก SP แจ้งเรื่อง overlap/duplicate ให้ถือเป็น 409
    const status = /overlap|duplicate|ซ้ำ|ครั้งต่อวัน/i.test(msg) ? 409 : 400
    return res.status(status).json({ ok: false, message: msg })
  }
})

/* ----------------------------------------------
   เพิ่มสำหรับฟีเจอร์ "หลักฐานการจอง"
   ---------------------------------------------- */

// 4.1 ดูการจองล่าสุดของ user ที่กำลังล็อกอิน
// GET /api/bookings/my-latest
router.get('/my-latest', requireAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store')

    const studentId = req.user?.student_id
    if (!studentId) return res.status(401).json({ error: 'Unauthenticated' })

    // เลือก "รายการล่าสุด" โดยเรียงจาก start_at ล่าสุด
    const [rows] = await pool.query(
      `SELECT b.id, b.room_id, r.room_code, b.start_at, b.end_at, b.created_by
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       WHERE b.created_by = ?
       ORDER BY b.start_at DESC
       LIMIT 1`,
      [studentId]
    )

    if (rows.length === 0) {
      return res.json(null) // ฝั่งหน้าเว็บจะตีความว่า "ยังไม่ได้จอง"
    }

    const booking = rows[0]
    const [mems] = await pool.query(
      'SELECT student_id FROM booking_members WHERE booking_id = ? ORDER BY id ASC',
      [booking.id]
    )

    // ถ้า stored procedure ใส่ owner เข้า booking_members ด้วย ให้ตัด owner ออก
    const members = mems.map(m => m.student_id).filter(sid => sid !== booking.created_by)

    return res.json({
      id: booking.id,
      room_code: booking.room_code,
      start_at: booking.start_at,
      end_at: booking.end_at,
      members
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

// 4.2 ยกเลิกการจอง (ลบ)
// DELETE /api/bookings/:id
// แนะนำให้ schema ตั้ง FK booking_members.booking_id → bookings.id เป็น ON DELETE CASCADE
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const bookingId = Number(req.params.id)
    const studentId = req.user?.student_id
    if (!studentId) return res.status(401).json({ error: 'Unauthenticated' })

    // ลบเฉพาะรายการที่ตัวเองเป็นผู้จอง
    const [r] = await pool.query(
      'DELETE FROM bookings WHERE id = ? AND created_by = ?',
      [bookingId, studentId]
    )

    // ถ้า schema ของคุณยังไม่ได้ cascade:
    // await pool.query('DELETE FROM booking_members WHERE booking_id = ?', [bookingId])
    // const [r] = await pool.query('DELETE FROM bookings WHERE id = ? AND created_by = ?', [bookingId, studentId])

    if (r.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบรายการ หรือไม่มีสิทธิ์ยกเลิก' })
    }
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

export default router
