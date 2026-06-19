const router = require('express').Router()
const connectController = require('../controllers/connectController')
const { requireAuth, optionalAuth } = require('../middleware/auth')

// Public read — anyone can browse approved peer profiles
router.get('/api/connects',     optionalAuth, connectController.getAll)
router.get('/api/connects/:id', optionalAuth, connectController.getOne)

// Write operations require a valid session
router.post('/api/connects',        requireAuth, connectController.create)
router.put('/api/connects/:id',     requireAuth, connectController.update)
router.delete('/api/connects/:id',  requireAuth, connectController.remove)

module.exports = router
