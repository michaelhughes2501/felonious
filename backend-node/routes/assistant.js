const router = require('express').Router()
const assistantController = require('../controllers/assistantController')

router.get('/api/assistant/events', assistantController.getEvents)
router.post('/api/assistant/chat', assistantController.chat)

module.exports = router
