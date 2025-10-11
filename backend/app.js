import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'

const app = express()
app.use(cors())
app.use(express.json())

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'booking_room'
})

// GET room types
app.get('/api/room-types', async (_req, res) => {
  const [rows] = await pool.query('SELECT id, type_name FROM room_types ORDER BY id')
  res.json(rows)
})

// GET rooms  (รองรับ /api/rooms?typeId=2)
// ถ้ามี typeId -> คืนเฉพาะห้องของประเภทนั้น; ถ้าไม่มี -> คืนทั้งหมด
app.get('/api/rooms', async (req, res) => {
  try {
    const { typeId } = req.query
    const hasType = typeof typeId !== 'undefined' && typeId !== ''

    let sql = `
      SELECT 
        r.id,
        r.room_code,
        r.room_type_id AS type_id,
        t.type_name
      FROM rooms r
      JOIN room_types t ON t.id = r.room_type_id
    `
    const params = []

    if (hasType) {
      sql += ' WHERE r.room_type_id = ?'
      params.push(Number(typeId))
    }

    sql += ' ORDER BY r.room_code'

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to load rooms' })
  }
})

// POST booking ผ่าน Stored Procedure
app.post('/api/bookings', async (req, res) => {
  try {
    const { room_code, start_at, end_at, created_by, members } = req.body
    await pool.query('CALL CreateBooking(?,?,?,?,?)', [
      room_code, start_at, end_at, created_by, JSON.stringify(members)
    ])
    res.json({ message: 'Booking created successfully' })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.sqlMessage || 'Booking failed' })
  }
})

// Start server
app.listen(3000, () => {
  console.log('✅ Backend running on http://localhost:3000')
})
