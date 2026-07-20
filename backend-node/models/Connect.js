const db = require('../config/db')

const ConnectModel = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM connects ORDER BY created_at DESC')
    return rows
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM connects WHERE id = ?', [id])
    return rows[0] || null
  },

  async create(handle, location, released_date, bio, contact, createdBy) {
    const [result] = await db.query(
      'INSERT INTO connects (handle, location, released_date, bio, contact, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [handle, location, released_date || null, bio, contact, createdBy || null]
    )
    return result.insertId
  },

  async update(id, handle, location, released_date, bio, contact) {
    const [result] = await db.query(
      'UPDATE connects SET handle=?, location=?, released_date=?, bio=?, contact=? WHERE id=?',
      [handle, location, released_date || null, bio, contact, id]
    )
    return result.affectedRows
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM connects WHERE id = ?', [id])
    return result.affectedRows
  },
}

module.exports = ConnectModel
