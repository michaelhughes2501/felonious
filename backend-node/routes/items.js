const router = require('express').Router()
const itemController = require('../controllers/itemController')

router.get('/api/items', itemController.getAll)
router.get('/api/items/:id', itemController.getOne)
router.post('/api/items', itemController.create)
router.put('/api/items/:id', itemController.update)
router.delete('/api/items/:id', itemController.remove)

module.exports = router
