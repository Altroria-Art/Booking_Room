// backend/routes/rooms.js
import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// 1) ประเภทห้อง
router.get('/room-types', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, type_name FROM room_types ORDER BY id'
  )
  res.json(rows)
})

// 2) ห้อง (เลือกได้ทั้งหมด หรือกรองตาม typeId)
router.get('/rooms', async (req, res) => {
  const { typeId } = req.query

  let sql = `
    SELECT
      r.id,
      r.room_code,
      r.room_type_id AS type_id,   -- ✅ alias ให้เป็น type_id เพื่อให้ฟรอนต์ใช้ต่อได้
      t.type_name
    FROM rooms r
    JOIN room_types t ON t.id = r.room_type_id
  `
  const params = []
  if (typeId) {                    // ✅ กรองด้วย room_type_id
    sql += ' WHERE r.room_type_id = ?'
    params.push(typeId)
  }
  sql += ' ORDER BY r.room_code'

  const [rows] = await pool.query(sql, params)
  res.json(rows)
})

export default router
