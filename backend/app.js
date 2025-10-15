// backend/app.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import authRoute from './routes/auth.js'
import bookingsRoute from './routes/bookings.js'
import reviewsRoute from './routes/reviews.js'   // ✅ เพิ่ม route รีวิว

const app = express()

// อนุญาต origin จาก .env (รองรับคอมมาแยกหลายโดเมน)
const origins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)

app.use(cors({
  origin: origins.length ? origins : true,  // ถ้าไม่ได้ตั้งไว้ จะเปิดให้ทุก origin (เฉพาะ dev)
  credentials: true
}))
app.use(express.json())

// health check
app.get('/api/health', (req, res) => res.json({ ok: true }))

// routes หลัก
app.use('/api/auth', authRoute)
app.use('/api/bookings', bookingsRoute)
app.use('/api/reviews', reviewsRoute)        // ✅ ผูก /api/reviews

// 404 สำหรับเส้นทางที่ไม่พบ
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

// error handler กลาง (กันแอปร่วง)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
