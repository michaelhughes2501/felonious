const router = require('express').Router()
const kitController = require('../controllers/kitController')

router.get('/api/kits', kitController.getAll)
router.get('/api/kits/:id', kitController.getOne)
router.post('/api/kits', kitController.create)
router.put('/api/kits/:id', kitController.update)
router.delete('/api/kits/:id', kitController.remove)

module.exports = router
