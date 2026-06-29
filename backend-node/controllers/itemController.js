const ItemModel = require('../models/Item')

function meta() {
  return { request_id: `req_${Date.now()}`, timestamp: new Date().toISOString(), version: 'v1' }
}

const itemController = {
  async getAll(req, res) {
    try {
      const items = await ItemModel.getAll()
      res.json({ success: true, data: { items }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async getOne(req, res) {
    try {
      const item = await ItemModel.getById(req.params.id)
      if (!item) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Item not found.' } })
      res.json({ success: true, data: { item }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async create(req, res) {
    try {
      const { name, description } = req.body
      if (!name) return res.status(400).json({ success: false, data: null, meta: meta(), error: { code: 'VALIDATION_ERROR', message: 'name is required.' } })
      const id = await ItemModel.create(name, description || '')
      const item = { id, name, description: description || '' }
      res.status(201).json({ success: true, data: { item }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async update(req, res) {
    try {
      const { name, description } = req.body
      if (!name) return res.status(400).json({ success: false, data: null, meta: meta(), error: { code: 'VALIDATION_ERROR', message: 'name is required.' } })
      const affected = await ItemModel.update(req.params.id, name, description || '')
      if (!affected) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Item not found.' } })
      const item = { id: Number(req.params.id), name, description: description || '' }
      res.json({ success: true, data: { item }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async remove(req, res) {
    try {
      const affected = await ItemModel.delete(req.params.id)
      if (!affected) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Item not found.' } })
      res.json({ success: true, data: { deleted: true }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },
}

module.exports = itemController
