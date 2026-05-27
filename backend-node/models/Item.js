const db = require('../config/db')

const ItemModel = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM items ORDER BY created_at DESC')
    return rows
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM items WHERE id = ?', [id])
    return rows[0] || null
  },

  async create(name, description) {
    const [result] = await db.query(
      'INSERT INTO items (name, description) VALUES (?, ?)',
      [name, description]
    )
    return result.insertId
  },

  async update(id, name, description) {
    const [result] = await db.query(
      'UPDATE items SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    )
    return result.affectedRows
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM items WHERE id = ?', [id])
    return result.affectedRows
  },
}

module.exports = ItemModel
