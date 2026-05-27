const ConnectModel = require('../models/Connect')

const connectController = {
  async getAll(req, res) {
    try {
      const connects = await ConnectModel.getAll()
      res.json(connects)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async getOne(req, res) {
    try {
      const connect = await ConnectModel.getById(req.params.id)
      if (!connect) return res.status(404).json({ error: 'Connect not found' })
      res.json(connect)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async create(req, res) {
    try {
      const { handle, location, released_date, bio, contact } = req.body
      if (!handle) return res.status(400).json({ error: 'handle is required' })
      const id = await ConnectModel.create(handle, location, released_date, bio, contact)
      res.status(201).json({ id, handle, location, released_date, bio, contact })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async update(req, res) {
    try {
      const { handle, location, released_date, bio, contact } = req.body
      if (!handle) return res.status(400).json({ error: 'handle is required' })
      const affected = await ConnectModel.update(req.params.id, handle, location, released_date, bio, contact)
      if (!affected) return res.status(404).json({ error: 'Connect not found' })
      res.json({ id: Number(req.params.id), handle, location, released_date, bio, contact })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async remove(req, res) {
    try {
      const affected = await ConnectModel.delete(req.params.id)
      if (!affected) return res.status(404).json({ error: 'Connect not found' })
      res.json({ message: 'Connect removed' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
}

module.exports = connectController
