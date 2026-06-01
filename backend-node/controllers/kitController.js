const KitModel = require('../models/Kit')

const kitController = {
  async getAll(req, res) {
    try {
      const kits = await KitModel.getAll(req.query.category)
      res.json(kits)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async getOne(req, res) {
    try {
      const kit = await KitModel.getById(req.params.id)
      if (!kit) return res.status(404).json({ error: 'Kit not found' })
      res.json(kit)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async create(req, res) {
    try {
      const { title, category, location, description, url } = req.body
      if (!title) return res.status(400).json({ error: 'title is required' })
      const id = await KitModel.create(title, category || 'general', location, description, url)
      res.status(201).json({ id, title, category, location, description, url })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async update(req, res) {
    try {
      const { title, category, location, description, url } = req.body
      if (!title) return res.status(400).json({ error: 'title is required' })
      const affected = await KitModel.update(req.params.id, title, category, location, description, url)
      if (!affected) return res.status(404).json({ error: 'Kit not found' })
      res.json({ id: Number(req.params.id), title, category, location, description, url })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async remove(req, res) {
    try {
      const affected = await KitModel.delete(req.params.id)
      if (!affected) return res.status(404).json({ error: 'Kit not found' })
      res.json({ message: 'Resource removed' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
}

module.exports = kitController
