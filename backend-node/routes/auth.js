const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')

router.post('/api/auth/register', authController.register)
router.post('/api/auth/login',    authController.login)
router.get('/api/auth/me',        requireAuth, authController.me)

module.exports = router
