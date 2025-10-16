// backend/routes/auth.js
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'

const router = express.Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim()
    const password = String(req.body?.password || '')
    if (!username || !password) {
      return res.status(400).json({ message: 'username/password required' })
    }

    const [rows] = await pool.query(
      'SELECT id, username, role, display_name, student_id, phone, email, password_hash FROM users WHERE username = ? LIMIT 1',
      [username]
    )
    const user = rows?.[0]
    if (!user) return res.status(401).json({ message: 'invalid credentials' })

    const ok = await bcrypt.compare(password, user.password_hash || '')
    if (!ok) return res.status(401).json({ message: 'invalid credentials' })

    // payload ที่จะฝังใน JWT (อย่าใส่ password_hash)
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      display_name: user.display_name,
      student_id: user.student_id,   // << ใช้ฝั่ง bookings
      phone: user.phone,
      email: user.email
    }

    const secret = process.env.JWT_SECRET || 'dev-secret'
    const token = jwt.sign(payload, secret, { expiresIn: '8h' })

    return res.json({ token, user: payload })
  } catch (e) {
    console.error('[auth/login]', e)
    return res.status(500).json({ message: 'server error' })
  }
})

// GET /api/auth/me  — ตรวจ token และคืนโปรไฟล์อย่างย่อ
router.get('/me', async (req, res) => {
  const h = String(req.headers?.authorization || '')
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(200).json({ user: null })

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret'
    const payload = jwt.verify(token, secret)
    // คืนเท่าที่ฝังไว้ตอน login
    return res.json({ user: {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      display_name: payload.display_name,
      student_id: payload.student_id,
      phone: payload.phone,
      email: payload.email
    }})
  } catch {
    return res.status(200).json({ user: null })
  }
})

export default router
