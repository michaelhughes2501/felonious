const db = require('../config/db')

const Resident = {
  /**
   * Create the residents table if it doesn't exist.
   * Called on server start.
   */
  async ensureTable() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS residents (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        handle      VARCHAR(100) NOT NULL UNIQUE,
        email       VARCHAR(255) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        location    VARCHAR(255),
        bio         TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
  },

  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM residents WHERE email = ? LIMIT 1', [email])
    return rows[0] || null
  },

  async findByHandle(handle) {
    const [rows] = await db.query('SELECT id, handle FROM residents WHERE handle = ? LIMIT 1', [handle])
    return rows[0] || null
  },

  async findById(id) {
    const [rows] = await db.query('SELECT id, handle, email, location, bio, created_at FROM residents WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  },

  async create({ handle, email, hashedPassword }) {
    const [result] = await db.query(
      'INSERT INTO residents (handle, email, password) VALUES (?, ?, ?)',
      [handle, email, hashedPassword]
    )
    return { id: result.insertId, handle, email }
  },
}

module.exports = Resident
