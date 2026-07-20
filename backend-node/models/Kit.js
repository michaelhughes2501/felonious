const db = require('../config/db')

const KitModel = {
  async getAll(category) {
    if (category) {
      const [rows] = await db.query('SELECT * FROM kits WHERE category = ? ORDER BY created_at DESC', [category])
      return rows
    }
    const [rows] = await db.query('SELECT * FROM kits ORDER BY created_at DESC')
    return rows
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM kits WHERE id = ?', [id])
    return rows[0] || null
  },

  async create(title, category, location, description, url, createdBy) {
    const [result] = await db.query(
      'INSERT INTO kits (title, category, location, description, url, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, category, location, description, url, createdBy || null]
    )
    return result.insertId
  },

  async update(id, title, category, location, description, url) {
    const [result] = await db.query(
      'UPDATE kits SET title=?, category=?, location=?, description=?, url=? WHERE id=?',
      [title, category, location, description, url, id]
    )
    return result.affectedRows
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM kits WHERE id = ?', [id])
    return result.affectedRows
  },
}

module.exports = KitModel
