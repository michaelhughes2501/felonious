const router = require('express').Router()
const itemController = require('../controllers/itemController')
const { requireAuth } = require('../middleware/auth')

// Public read
router.get('/api/items', itemController.getAll)
router.get('/api/items/:id', itemController.getOne)

// Write operations require a valid session
router.post('/api/items', requireAuth, itemController.create)
router.put('/api/items/:id', requireAuth, itemController.update)
router.delete('/api/items/:id', requireAuth, itemController.remove)

module.exports = router
