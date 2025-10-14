// booking-api/middlewares/auth.js
import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ message: 'no token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (e) {
    return res.status(401).json({ message: 'invalid token' })
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'unauthorized' })
    if (req.user.role !== role) return res.status(403).json({ message: 'forbidden' })
    next()
  }
}
