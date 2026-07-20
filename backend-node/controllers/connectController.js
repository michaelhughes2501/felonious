const ConnectModel = require('../models/Connect')

function meta() {
  return { request_id: `req_${Date.now()}`, timestamp: new Date().toISOString(), version: 'v1' }
}

const connectController = {
  async getAll(req, res) {
    try {
      const connects = await ConnectModel.getAll()
      res.json({ success: true, data: { connects }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async getOne(req, res) {
    try {
      const connect = await ConnectModel.getById(req.params.id)
      if (!connect) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Peer not found.' } })
      res.json({ success: true, data: { connect }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async create(req, res) {
    try {
      const { handle, location, released_date, bio, contact } = req.body
      if (!handle) return res.status(400).json({ success: false, data: null, meta: meta(), error: { code: 'VALIDATION_ERROR', message: 'handle is required.' } })
      const id = await ConnectModel.create(handle, location, released_date, bio, contact, req.resident.id)
      const connect = { id, handle, location, released_date, bio, contact, created_by: req.resident.id }
      res.status(201).json({ success: true, data: { connect }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async update(req, res) {
    try {
      const existing = await ConnectModel.getById(req.params.id)
      if (!existing) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Peer not found.' } })
      if (existing.created_by != null && existing.created_by !== req.resident.id) {
        return res.status(403).json({ success: false, data: null, meta: meta(), error: { code: 'FORBIDDEN', message: 'You can only edit peer profiles you created.' } })
      }

      const { handle, location, released_date, bio, contact } = req.body
      if (!handle) return res.status(400).json({ success: false, data: null, meta: meta(), error: { code: 'VALIDATION_ERROR', message: 'handle is required.' } })
      const affected = await ConnectModel.update(req.params.id, handle, location, released_date, bio, contact)
      if (!affected) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Peer not found.' } })
      const connect = { id: Number(req.params.id), handle, location, released_date, bio, contact }
      res.json({ success: true, data: { connect }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },

  async remove(req, res) {
    try {
      const existing = await ConnectModel.getById(req.params.id)
      if (!existing) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Peer not found.' } })
      if (existing.created_by != null && existing.created_by !== req.resident.id) {
        return res.status(403).json({ success: false, data: null, meta: meta(), error: { code: 'FORBIDDEN', message: 'You can only delete peer profiles you created.' } })
      }

      const affected = await ConnectModel.delete(req.params.id)
      if (!affected) return res.status(404).json({ success: false, data: null, meta: meta(), error: { code: 'NOT_FOUND', message: 'Peer not found.' } })
      res.json({ success: true, data: { deleted: true }, meta: meta(), error: null })
    } catch (err) {
      res.status(500).json({ success: false, data: null, meta: meta(), error: { code: 'SERVER_ERROR', message: err.message } })
    }
  },
}

module.exports = connectController
