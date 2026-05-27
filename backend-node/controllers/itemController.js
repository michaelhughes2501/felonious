const ItemModel = require('../models/Item')

const itemController = {
  async getAll(req, res) {
    try {
      const items = await ItemModel.getAll()
      res.json(items)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async getOne(req, res) {
    try {
      const item = await ItemModel.getById(req.params.id)
      if (!item) return res.status(404).json({ error: 'Item not found' })
      res.json(item)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async create(req, res) {
    try {
      const { name, description } = req.body
      if (!name) return res.status(400).json({ error: 'name is required' })
      const id = await ItemModel.create(name, description || '')
      res.status(201).json({ id, name, description: description || '' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async update(req, res) {
    try {
      const { name, description } = req.body
      if (!name) return res.status(400).json({ error: 'name is required' })
      const affected = await ItemModel.update(req.params.id, name, description || '')
      if (!affected) return res.status(404).json({ error: 'Item not found' })
      res.json({ id: Number(req.params.id), name, description: description || '' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async remove(req, res) {
    try {
      const affected = await ItemModel.delete(req.params.id)
      if (!affected) return res.status(404).json({ error: 'Item not found' })
      res.json({ message: 'Item deleted' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
}

module.exports = itemController
