// booking-api/app.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import authRoute from './routes/auth.js'
import bookingsRoute from './routes/bookings.js'

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoute)
app.use('/api/bookings', bookingsRoute)

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
