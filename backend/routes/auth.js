// booking-api/routes/auth.js
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'

const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ message: 'username/password required' })

    const [rows] = await pool.query('SELECT * FROM users WHERE username=?', [username])
    const user = rows[0]
    if (!user) return res.status(401).json({ message: 'invalid credentials' })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ message: 'invalid credentials' })

    // payload ที่จะฝังใน JWT
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      display_name: user.display_name,
      student_id: user.student_id,
      phone: user.phone,
      email: user.email
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' })
    return res.json({ token, user: payload })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'server error' })
  }
})

// ใช้ตรวจว่า token ยังดีไหม + ดึงข้อมูลโปรไฟล์
router.get('/me', async (req, res) => {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(200).json({ user: null })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return res.json({ user: payload })
  } catch {
    return res.status(200).json({ user: null })
  }
})

export default router
