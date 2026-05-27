const router = require('express').Router()
const connectController = require('../controllers/connectController')

router.get('/api/connects', connectController.getAll)
router.get('/api/connects/:id', connectController.getOne)
router.post('/api/connects', connectController.create)
router.put('/api/connects/:id', connectController.update)
router.delete('/api/connects/:id', connectController.remove)

module.exports = router
