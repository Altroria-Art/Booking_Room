// booking-api/server.js  (ทั้งไฟล์)
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()

// อนุญาตให้ FE ที่ 5173 เรียกได้
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// สร้าง pool ไป MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'booking_room',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
})

// ----- routes พื้นฐาน -----
app.get('/', (_req, res) => {
  res.send('Booking API is running. Try /health or /rooms')
})

app.get('/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok')
    res.json({ ok: rows[0].ok === 1 })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
})

// รายการห้อง
app.get('/rooms', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, code, name, building, capacity FROM rooms ORDER BY name'
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ message: 'DB error', error: String(e) })
  }
})

// การจองทุกห้องของวันนั้น (YYYY-MM-DD)
app.get('/bookings', async (req, res) => {
  const date = req.query.date
  if (!date) return res.status(400).json({ message: 'date is required (YYYY-MM-DD)' })
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.room_id, b.start_at, b.end_at, b.purpose, b.status,
              u.name AS user_name, u.email AS user_email,
              r.code AS room_code, r.name AS room_name
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       JOIN rooms r ON r.id = b.room_id
       WHERE DATE(b.start_at) <= ? AND DATE(b.end_at) >= ?
       ORDER BY b.room_id, b.start_at`,
      [date, date]
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ message: 'DB error', error: String(e) })
  }
})

// จำกัดเวลาอนุญาตในวันนั้น + จองห้อง
const START_HOUR = 8   // 08:00
const END_HOUR   = 16  // 16:00

app.post('/bookings', async (req, res) => {
  const { user_id, room_id, start_at, end_at, purpose } = req.body
  if (!user_id || !room_id || !start_at || !end_at) {
    return res.status(400).json({ message: 'missing required fields' })
  }
  const s = new Date(start_at)
  const e = new Date(end_at)
  if (isNaN(s) || isNaN(e) || s >= e) {
    return res.status(400).json({ message: 'invalid start/end time' })
  }
  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate()
  if (!sameDay) return res.status(400).json({ message: 'booking must be within the same day' })

  const sHour = s.getHours() + s.getMinutes() / 60
  const eHour = e.getHours() + e.getMinutes() / 60
  if (sHour < START_HOUR || eHour > END_HOUR) {
    return res.status(400).json({ message: 'booking must be within 08:00–16:00' })
  }

  try {
    const [conflict] = await pool.query(
      `SELECT 1 FROM bookings
       WHERE room_id = ?
         AND status IN ('pending','approved')
         AND NOT (? <= start_at OR ? >= end_at)
       LIMIT 1`,
      [room_id, end_at, start_at]
    )
    if (conflict.length) return res.status(409).json({ message: 'time slot already booked' })

    const [result] = await pool.query(
      `INSERT INTO bookings (user_id, room_id, start_at, end_at, purpose, status)
       VALUES (?,?,?,?,?,'pending')`,
      [user_id, room_id, start_at, end_at, purpose ?? null]
    )
    res.status(201).json({ id: result.insertId })
  } catch (e) {
    res.status(500).json({ message: 'DB error', error: String(e) })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
