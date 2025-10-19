// backend/routes/bookings.js
import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middlewares/auth.js'

const router = express.Router()

/* ----------------------------------------------
   helpers
---------------------------------------------- */
const sanitizeId = (s) => String(s || '').replace(/\s+/g, '').trim()
const validStudentId = (id) => /^\d{8,10}$/.test(id)

// ✅ ensure admin: รองรับ 'ADMIN'/'admin', boolean, 1, '1', 'true'
const ensureAdmin = (req, res, next) => {
  const u = req.user || {}
  const role = String(u.role || '').toLowerCase()

  const isAdmin =
    role === 'admin' ||
    u.is_admin === true || u.isAdmin === true ||
    u.is_admin === 1    || u.isAdmin === 1 ||
    String(u.is_admin) === '1' || String(u.isAdmin) === '1' ||
    String(u.is_admin).toLowerCase() === 'true' || String(u.isAdmin).toLowerCase() === 'true'

  if (isAdmin) return next()
  return res.status(403).json({ error: 'forbidden' })
}

// หา conflict เฉพาะ “วันเดียวกัน”
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
   GET /api/bookings?date=YYYY-MM-DD[&roomCode=...]
---------------------------------------------- */
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toLocaleDateString('sv-SE')
    const roomCode = req.query.roomCode || null

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

/* ----------------------------------------------
   GET /api/bookings/my?date=YYYY-MM-DD[&roomCode=...]
---------------------------------------------- */
router.get('/my', requireAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store')

    const date = req.query.date || new Date().toISOString().slice(0, 10)
    const roomCode = req.query.roomCode || null

    const studentId = sanitizeId(req.user?.student_id)
    if (!studentId) {
      return res.status(401).json({ ok: false, message: 'Unauthenticated' })
    }

    const params = [studentId, date]
    const roomFilter = roomCode ? ' AND r.room_code = ? ' : ''
    if (roomCode) params.push(roomCode)

    const [rows] = await pool.query(
      `SELECT
         b.id, b.room_id, r.room_code,
         TIME_FORMAT(b.start_at, '%H:%i') AS start_hhmm,
         TIME_FORMAT(b.end_at,   '%H:%i') AS end_hhmm,
         b.start_at, b.end_at, b.created_by,
         COALESCE(u.display_name, '') AS display_name
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       LEFT JOIN users u ON u.student_id = b.created_by
       WHERE b.created_by = ?
         AND DATE(b.start_at) = ? ${roomFilter}
       ORDER BY b.start_at
       LIMIT 1`,
      params
    )

    if (rows.length === 0) {
      return res.json({ ok: true, date, data: null })
    }

    const booking = rows[0]

    const [mems] = await pool.query(
      `SELECT student_id
         FROM booking_members
        WHERE booking_id = ?
        ORDER BY id ASC`,
      [booking.id]
    )
    booking.members = mems
      .map(m => m.student_id)
      .filter(sid => sid !== booking.created_by)

    return res.json({ ok: true, date, data: booking })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ ok: false, message: 'failed to load my booking' })
  }
})

/* ----------------------------------------------
   POST /api/bookings
---------------------------------------------- */
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

    let list = [createdBy, ...members.map(sanitizeId)].filter(Boolean)
    list = Array.from(new Set(list))

    if (list.length < 5 || list.length > 10) {
      return res.status(400).json({ message: 'จำนวนสมาชิกต้อง 5–10 คน (รวมเจ้าของ)' })
    }

    const bad = list.find((id) => !validStudentId(id))
    if (bad) {
      return res.status(400).json({ message: `รูปแบบรหัสนิสิตไม่ถูกต้อง: ${bad}` })
    }

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

    const conflicts = await findConflictsByRoomCode(roomCode, startAt, endAt)
    if (conflicts.length) {
      return res.status(409).json({
        ok: false,
        message: 'ช่วงเวลาที่เลือกชนกับการจองเดิม',
        conflicts,
      })
    }

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
    const status = /overlap|duplicate|ซ้ำ|ครั้งต่อวัน/i.test(msg) ? 409 : 400
    return res.status(status).json({ ok: false, message: msg })
  }
})

/* ----------------------------------------------
   GET /api/bookings/my-latest
---------------------------------------------- */
router.get('/my-latest', requireAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store')
    const studentId = req.user?.student_id
    if (!studentId) return res.status(401).json({ error: 'Unauthenticated' })

    const date = req.query.date

    if (date) {
      const [rows] = await pool.query(
        `SELECT b.id, b.room_id, r.room_code, b.start_at, b.end_at, b.created_by
         FROM bookings b
         JOIN rooms r ON r.id = b.room_id
         WHERE b.created_by = ? AND DATE(b.start_at) = ?
         ORDER BY b.start_at
         LIMIT 1`,
        [studentId, date]
      )
      if (rows.length === 0) return res.json(null)
      const booking = rows[0]
      const [mems] = await pool.query(
        'SELECT student_id FROM booking_members WHERE booking_id = ? ORDER BY id ASC',
        [booking.id]
      )
      const members = mems.map(m => m.student_id).filter(sid => sid !== booking.created_by)
      return res.json({ ...booking, members })
    }

    const [rows] = await pool.query(
      `SELECT b.id, b.room_id, r.room_code, b.start_at, b.end_at, b.created_by
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       WHERE b.created_by = ?
       ORDER BY b.start_at DESC
       LIMIT 1`,
      [studentId]
    )
    if (rows.length === 0) return res.json(null)

    const booking = rows[0]
    const [mems] = await pool.query(
      'SELECT student_id FROM booking_members WHERE booking_id = ? ORDER BY id ASC',
      [booking.id]
    )
    const members = mems.map(m => m.student_id).filter(sid => sid !== booking.created_by)
    return res.json({ ...booking, members })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

/* ----------------------------------------------
   DELETE /api/bookings/:id  ← ผู้ใช้ยกเลิกของตัวเอง (ใหม่)
---------------------------------------------- */
router.delete('/:id(\\d+)', requireAuth, async (req, res) => {
  const id = Number(req.params.id || 0)
  if (!id) return res.status(400).json({ error: 'invalid_id' })

  // รองรับได้ทั้ง student_id และ studentId
  const sid = sanitizeId(req.user?.student_id || req.user?.studentId)
  if (!sid) return res.status(401).json({ error: 'unauthorized' })

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // ล็อกแถวและตรวจว่าเป็นเจ้าของจริง
    const [rows] = await conn.query(
      'SELECT id, created_by FROM bookings WHERE id = ? FOR UPDATE',
      [id]
    )
    if (rows.length === 0) {
      await conn.rollback()
      return res.status(404).json({ error: 'not_found' })
    }
    if (String(rows[0].created_by) !== sid) {
      await conn.rollback()
      return res.status(403).json({ error: 'forbidden' })
    }

    // ลบสมาชิกก่อน เพื่อรองรับ schema ที่ไม่ตั้ง CASCADE
    await conn.query('DELETE FROM booking_members WHERE booking_id = ?', [id])
    const [ret] = await conn.query('DELETE FROM bookings WHERE id = ?', [id])

    await conn.commit()
    return res.json({ success: !!ret.affectedRows })
  } catch (e) {
    await conn.rollback()
    console.error('DELETE /bookings/:id failed', e)
    return res.status(500).json({ error: 'server_error' })
  } finally {
    conn.release()
  }
})

/* =================================================================
   ==============      ADMIN ENDPOINTS (ใหม่)      ==================
================================================================= */

/** GET /api/bookings/admin?date=YYYY-MM-DD[&roomCode=...] */
router.get('/admin', requireAuth, ensureAdmin, async (req, res) => {
  try {
    const date = req.query.date || new Date().toLocaleDateString('sv-SE')
    const roomCode = req.query.roomCode || null

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
    console.error('GET /bookings/admin failed', e)
    res.status(500).json({ error: 'server_error' })
  }
})

/** ✅ GET /api/bookings/admin/:id → รายละเอียดรายการเดียวสำหรับโมดัล */
router.get('/admin/:id', requireAuth, ensureAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    console.log('[ADMIN] GET /bookings/admin/%s', id)

    const [rows] = await pool.query(
      `SELECT
         b.id, b.room_id, r.room_code,
         b.start_at, b.end_at,
         TIME_FORMAT(b.start_at, '%H:%i') AS start_hhmm,
         TIME_FORMAT(b.end_at,   '%H:%i') AS end_hhmm,
         b.created_by,
         COALESCE(u.display_name,'') AS display_name
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       LEFT JOIN users u ON u.student_id = b.created_by
       WHERE b.id = ?
       LIMIT 1`,
      [id]
    )
    if (!rows.length) return res.status(404).json({ error: 'not found' })
    const row = rows[0]

    const [members] = await pool.query(
      `SELECT student_id
         FROM booking_members
        WHERE booking_id = ?
        ORDER BY id`,
      [id]
    )

    res.set('Cache-Control', 'no-store')
    res.json({
      id: row.id,
      room_id: row.room_id,
      room_code: row.room_code,
      start_at: row.start_at,
      end_at: row.end_at,
      start_hhmm: row.start_hhmm,
      end_hhmm:   row.end_hhmm,
      created_by: row.created_by,
      display_name: row.display_name || null,
      members: members.map(m => m.student_id).filter(s => s !== row.created_by),
    })
  } catch (e) {
    console.error('GET /bookings/admin/:id failed', e)
    res.status(500).json({ error: 'server_error' })
  }
})

/** DELETE /api/bookings/admin/:id → แอดมินยกเลิกการจอง */
router.delete('/admin/:id', requireAuth, ensureAdmin, async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const id = req.params.id
    await conn.beginTransaction()
    await conn.query('DELETE FROM booking_members WHERE booking_id = ?', [id])
    const [ret] = await conn.query('DELETE FROM bookings WHERE id = ?', [id])
    await conn.commit()
    if (!ret.affectedRows) return res.status(404).json({ error: 'not found' })
    res.json({ success: true })
  } catch (e) {
    await conn.rollback()
    console.error('DELETE /bookings/admin/:id failed', e)
    res.status(500).json({ error: 'server_error' })
  } finally {
    conn.release()
  }
})

export default router
