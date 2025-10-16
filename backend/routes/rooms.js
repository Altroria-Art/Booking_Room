import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// 1) ดึงประเภทห้องไว้ใส่ select
router.get('/room-types', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, type_name FROM room_types ORDER BY id'
  )
  res.json(rows)
})

// 2) ดึงรายการห้อง (ทั้งหมด หรือกรองด้วย ?typeId=)
router.get('/rooms', async (req, res) => {
  const typeId = req.query.typeId ? Number(req.query.typeId) : null // 🔧 cast เป็นตัวเลขถ้ามี

  let sql = `
    SELECT
      r.id,
      r.room_code,
      r.room_type_id,
      t.type_name
    FROM rooms r
    JOIN room_types t ON t.id = r.room_type_id
  `
  const params = []
  if (typeId) {
    sql += ' WHERE r.room_type_id = ?'
    params.push(typeId)
  }
  sql += ' ORDER BY r.room_code'

  const [rows] = await pool.query(sql, params)
  res.json(rows)
})

/* 2.5) 🆕 เพิ่มห้องใหม่ (ใช้กับปุ่ม “เพิ่มห้อง”) */
router.post('/rooms', async (req, res) => {
  const { room_code, room_type_id } = req.body

  if (!room_code || room_type_id == null) {
    return res.status(400).json({ message: 'room_code และ room_type_id ต้องไม่ว่าง' })
  }

  try {
    const code = String(room_code).trim()
    const typeId = Number(room_type_id)

    const [result] = await pool.query(
      'INSERT INTO rooms (room_code, room_type_id) VALUES (?, ?)',
      [code, typeId]
    )
    const insertedId = result.insertId

    const [[row]] = await pool.query(
      `SELECT r.id, r.room_code, r.room_type_id, t.type_name
       FROM rooms r JOIN room_types t ON t.id = r.room_type_id
       WHERE r.id = ?`,
      [insertedId]
    )
    return res.status(201).json(row)
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'รหัสห้องซ้ำ (room_code มีอยู่แล้ว)' })
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', detail: err.message })
  }
})

// 3) อัปเดตห้องตาม id
router.put('/rooms/:id', async (req, res) => {
  const id = Number(req.params.id)                    // 🔧 cast id
  const { room_code, room_type_id } = req.body

  if (!room_code || room_type_id == null) {
    return res.status(400).json({ message: 'room_code และ room_type_id ต้องไม่ว่าง' })
  }

  try {
    const [result] = await pool.query(
      'UPDATE rooms SET room_code = ?, room_type_id = ? WHERE id = ?',
      [String(room_code).trim(), Number(room_type_id), id] // 🔧 trim & cast
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบห้องที่ต้องการแก้ไข' })
    }

    const [[updated]] = await pool.query(
      `SELECT r.id, r.room_code, r.room_type_id, t.type_name
       FROM rooms r JOIN room_types t ON t.id = r.room_type_id
       WHERE r.id = ?`,
      [id]
    )
    res.json(updated)
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'รหัสห้องซ้ำ (room_code มีอยู่แล้ว)' })
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', detail: err.message })
  }
})

// 4) ลบห้องตาม id
router.delete('/rooms/:id', async (req, res) => {
  try {
    const id = Number(req.params.id) // 🔧 cast id
    const [result] = await pool.query('DELETE FROM rooms WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบห้องที่ต้องการลบ' })
    }
    res.status(204).send()
  } catch (err) {
    // มีการจองอ้างอิงอยู่ → FK ห้ามลบ
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.status(409).json({ message: 'ลบไม่ได้: ห้องนี้มีการจองอยู่' })
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', detail: err.message })
  }
})

export default router
