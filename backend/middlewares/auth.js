// booking-api/middlewares/auth.js
import jwt from 'jsonwebtoken'

// ทำให้โครงสร้าง req.user มีได้ทั้ง studentId และ student_id (รวมถึง userId/user_id)
function normalizeUser(u = {}) {
  const studentId = u.studentId ?? u.student_id ?? process.env.DEV_STUDENT_ID ?? ''
  const userId    = u.userId    ?? u.user_id    ?? u.id ?? process.env.DEV_USER_ID ?? ''
  const role      = u.role      ?? u.user_role  ?? process.env.DEV_ROLE ?? 'USER'
  const name      = u.displayName ?? u.name ?? u.username ?? process.env.DEV_DISPLAY_NAME ?? 'Dev User'

  return {
    ...u,
    // ใส่ทั้งสองคีย์ให้ route ไหนๆ ก็ใช้ได้
    studentId,
    student_id: studentId,
    userId,
    user_id: userId,
    role,
    displayName: name,
    name,
  }
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7).trim() : ''

  // ✅ DEV bypass: dev-token
  if (process.env.ALLOW_DEV_TOKEN === '1' && token === (process.env.DEV_TOKEN || 'dev-token')) {
    req.user = normalizeUser({
      userId: process.env.DEV_USER_ID || 'dev',
      studentId: process.env.DEV_STUDENT_ID || '67022928',
      role: process.env.DEV_ROLE || 'USER',
      displayName: process.env.DEV_DISPLAY_NAME || 'Dev User',
    })
    return next()
  }

  if (!token) return res.status(401).json({ message: 'no token' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = normalizeUser(payload)
    return next()
  } catch (e) {
    return res.status(401).json({ message: 'invalid token' })
  }
}

// รองรับ role เดี่ยว/หลาย role
export function requireRole(role) {
  const roles = Array.isArray(role) ? role : [role]
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'unauthorized' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'forbidden' })
    next()
  }
}
