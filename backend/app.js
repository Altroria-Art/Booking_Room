// backend/app.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import authRoute from './routes/auth.js'
import bookingsRoute from './routes/bookings.js'
import reviewsRoute from './routes/reviews.js'
import roomsRoute from './routes/rooms.js'

const app = express()

// ลดข้อมูล header ที่ไม่จำเป็น
app.disable('x-powered-by')

// อนุญาต origin จาก .env (รองรับคอมมาแยกหลายโดเมน)
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const corsOptions = {
  origin: origins.length ? origins : true,  // ถ้าไม่ได้ตั้งไว้ จะเปิดให้ทุก origin (เฉพาะ dev)
  credentials: true,
}

// CORS + Preflight
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Body parsers
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// health check
app.get('/api/health', (req, res) => res.json({ ok: true }))

// routes หลัก
app.use('/api/auth', authRoute)
app.use('/api/bookings', bookingsRoute)  // ✅ สำคัญ: ให้ path เป็น /api/bookings/...
app.use('/api/reviews', reviewsRoute)
app.use('/api', roomsRoute)              // => /api/room-types, /api/rooms

// 404 สำหรับเส้นทางที่ไม่พบ
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

// error handler กลาง (กันแอปร่วง)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: 'Internal server error' })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`[OK] API listening on http://localhost:${port}`)
  if (origins.length) {
    console.log(`[CORS] Allowed origins: ${origins.join(', ')}`)
  } else {
    console.log('[CORS] Allow all origins (dev)')
  }
})
