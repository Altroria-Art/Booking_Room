// backend/routes/reviews.js
import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// GET /api/reviews?page=1&pageSize=5&room_id=1
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize ?? '5', 10), 1), 50)
    const { room_id } = req.query

    const where = []
    const params = {}
    if (room_id) { where.push('r.room_id = :room_id'); params.room_id = parseInt(room_id, 10) }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM reviews r ${whereSql}`, params
    )

    const offset = (page - 1) * pageSize
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_by, r.room_id, r.created_at,
              u.display_name
       FROM reviews r
       LEFT JOIN users u ON u.student_id = r.created_by
       ${whereSql}
       ORDER BY r.created_at DESC
       LIMIT :limit OFFSET :offset`,
      { ...params, limit: pageSize, offset }
    )

    res.json({ page, pageSize, total, data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch reviews' })
  }
})

// POST /api/reviews  body: { rating(1-5), comment, created_by(student_id), room_id? }
router.post('/', async (req, res) => {
  try {
    let { rating, comment, created_by, room_id } = req.body ?? {}
    rating = parseInt(rating, 10)

    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'rating must be 1-5' })
    if (!comment || !String(comment).trim())
      return res.status(400).json({ message: 'comment is required' })
    if (!created_by || !String(created_by).trim())
      return res.status(400).json({ message: 'created_by (student id) is required' })

    if (room_id !== undefined && room_id !== null && room_id !== '') {
      room_id = parseInt(room_id, 10)
      if (!Number.isInteger(room_id) || room_id <= 0)
        return res.status(400).json({ message: 'room_id invalid' })
    } else {
      room_id = null
    }

    const [ins] = await pool.query(
      `INSERT INTO reviews (rating, comment, created_by, room_id)
       VALUES (:rating, :comment, :created_by, :room_id)`,
      { rating, comment, created_by, room_id }
    )

    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_by, r.room_id, r.created_at,
              u.display_name
       FROM reviews r
       LEFT JOIN users u ON u.student_id = r.created_by
       WHERE r.id = :id`,
      { id: ins.insertId }
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create review' })
  }
})

export default router
