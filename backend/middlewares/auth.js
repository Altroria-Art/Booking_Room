// backend/middlewares/auth.js
import jwt from 'jsonwebtoken'

// ---------------- helpers ----------------
function normalizeUser(u = {}) {
  const studentId =
    u.studentId ?? u.student_id ?? process.env.DEV_STUDENT_ID ?? ''
  const userId =
    u.userId ?? u.user_id ?? u.id ?? process.env.DEV_USER_ID ?? ''
  const role =
    u.role ?? u.user_role ?? process.env.DEV_ROLE ?? 'USER'
  const name =
    u.displayName ?? u.name ?? u.username ?? process.env.DEV_DISPLAY_NAME ?? 'Dev User'

  return {
    ...u,
    studentId,
    student_id: studentId,
    userId,
    user_id: userId,
    role,
    displayName: name,
    name,
  }
}

function truthyEnv(v) {
  return String(v ?? '').trim().toLowerCase() === '1'
      || String(v ?? '').trim().toLowerCase() === 'true'
      || String(v ?? '').trim().toLowerCase() === 'yes'
}

function extractToken(req) {
  // 1) Authorization: Bearer <token>
  const h = req.headers?.authorization || ''
  if (h && /^Bearer\s+/i.test(h)) return h.replace(/^Bearer\s+/i, '').trim()

  // 2) เฮดเดอร์สำรอง
  const xt = req.headers['x-access-token'] || req.headers['x-auth-token']
  if (typeof xt === 'string' && xt) return xt.trim()

  // 3) คุ้กกี้ (ถ้ามี cookie-parser)
  const ck = req.cookies?.token || req.cookies?.access_token
  if (typeof ck === 'string' && ck) return ck.trim()

  // 4) รูปแบบ "Token token=xxx"
  if (h && /^Token\s+token=/i.test(h)) {
    const m = h.match(/^Token\s+token=(.+)$/i)
    if (m) return m[1].trim()
  }

  // 5) (ทางเลือก) ใช้ ?token= สำหรับ dev utility
  if (req.query?.token) return String(req.query.token).trim()

  return ''
}

// ---------------- middlewares --------------
export function requireAuth(req, res, next) {
  const token = extractToken(req)

  // DEV bypass
  const devEnabled = truthyEnv(process.env.ALLOW_DEV_TOKEN)
  const devToken = process.env.DEV_TOKEN || 'dev-token'
  if (devEnabled && token === devToken) {
    req.user = normalizeUser({
      userId: process.env.DEV_USER_ID || 'dev',
      studentId: process.env.DEV_STUDENT_ID || '67022928',
      role: process.env.DEV_ROLE || 'USER',
      displayName: process.env.DEV_DISPLAY_NAME || 'Dev User',
    })
    return next()
  }

  if (!token) {
    return res.status(401).json({ message: 'no token' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = normalizeUser(payload)
    return next()
  } catch {
    return res.status(401).json({ message: 'invalid token' })
  }
}

// ใช้เมื่อไม่บังคับล็อกอิน แต่ถ้ามี token ก็ผูก req.user ให้
export function optionalAuth(req, res, next) {
  const token = extractToken(req)
  if (!token) return next()
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = normalizeUser(payload)
  } catch {
    // เงียบไว้
  }
  next()
}

// บังคับสิทธิ์ตาม role (รองรับ array)
export function requireRole(role) {
  const roles = Array.isArray(role) ? role : [role]
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'unauthorized' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'forbidden' })
    }
    next()
  }
}

// shortcuts
export const requireAdmin = requireRole('ADMIN')
export const requireStaffOrAdmin = requireRole(['STAFF', 'ADMIN'])
