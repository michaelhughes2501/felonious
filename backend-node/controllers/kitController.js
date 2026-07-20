const KitModel = require('../models/Kit')

function meta() {
  return { request_id: `req_${Date.now()}`, timestamp: new Date().toISOString(), version: 'v1' }
}

const kitController = {
  async getAll(req, res) {
    try {
      const kits = await KitModel.getAll(req.query.category)
      res.json({ success: true, data: { kits }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async getOne(req, res) {
    try {
      const kit = await KitModel.getById(req.params.id)
      if (!kit) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Resource not found.' } })
      res.json({ success: true, data: { kit }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async create(req, res) {
    try {
      const { title, category, location, description, url } = req.body
      if (!title) return res.status(400).json({ success: false, data: null, meta: meta(), error: { code: 'VALIDATION_ERROR', message: 'title is required.' } })
      const id = await KitModel.create(title, category || 'general', location, description, url, req.resident.id)
      const kit = { id, title, category: category || 'general', location, description, url, created_by: req.resident.id }
      res.status(201).json({ success: true, data: { kit }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async update(req, res) {
    try {
      const existing = await KitModel.getById(req.params.id)
      if (!existing) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Resource not found.' } })
      if (existing.created_by != null && existing.created_by != req.resident.id) {
        return res.status(403).json({ success: false, data: null, meta: meta(), error: { code: 'FORBIDDEN', message: 'You can only edit resources you created.' } })
      }

      const { title, category, location, description, url } = req.body
      if (!title) return res.status(400).json({ success: false, data: null, meta: meta(), error: { code: 'VALIDATION_ERROR', message: 'title is required.' } })
      const affected = await KitModel.update(req.params.id, title, category, location, description, url)
      if (!affected) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Resource not found.' } })
      const kit = { id: Number(req.params.id), title, category, location, description, url }
      res.json({ success: true, data: { kit }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async remove(req, res) {
    try {
      const existing = await KitModel.getById(req.params.id)
      if (!existing) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Resource not found.' } })
      if (existing.created_by != null && existing.created_by != req.resident.id) {
        return res.status(403).json({ success: false, data: null, meta: meta(), error: { code: 'FORBIDDEN', message: 'You can only delete resources you created.' } })
      }

      const affected = await KitModel.delete(req.params.id)
      if (!affected) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Resource not found.' } })
      res.json({ success: true, data: { deleted: true }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },
}

module.exports = kitController
