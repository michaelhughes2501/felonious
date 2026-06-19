const router = require('express').Router()
const kitController = require('../controllers/kitController')
const { requireAuth, optionalAuth } = require('../middleware/auth')

// Public read — resources are open to all
router.get('/api/kits',     optionalAuth, kitController.getAll)
router.get('/api/kits/:id', optionalAuth, kitController.getOne)

// Write operations require a valid session
router.post('/api/kits',        requireAuth, kitController.create)
router.put('/api/kits/:id',     requireAuth, kitController.update)
router.delete('/api/kits/:id',  requireAuth, kitController.remove)

module.exports = router
