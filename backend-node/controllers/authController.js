const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Resident = require('../models/Resident')
const { JWT_SECRET } = require('../middleware/auth')

const SALT_ROUNDS = 12
const TOKEN_TTL = '7d'

function issueToken(resident) {
  return jwt.sign(
    { id: resident.id, handle: resident.handle },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  )
}

const authController = {
  async register(req, res) {
    const { handle, email, password } = req.body

    if (!handle || !email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'handle, email, and password are required.' },
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters.' },
      })
    }

    try {
      const existing = await Resident.findByEmail(email)
      if (existing) {
        return res.status(409).json({
          success: false,
          data: null,
          error: { code: 'EMAIL_TAKEN', message: 'An account with that email already exists.' },
        })
      }

      const existingHandle = await Resident.findByHandle(handle)
      if (existingHandle) {
        return res.status(409).json({
          success: false,
          data: null,
          error: { code: 'HANDLE_TAKEN', message: 'An account with that handle already exists.' },
        })
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
      const resident = await Resident.create({ handle, email, hashedPassword })
      const token = issueToken(resident)

      return res.status(201).json({
        success: true,
        data: { token, resident: { id: resident.id, handle: resident.handle, email: resident.email } },
        error: null,
      })
    } catch (err) {
      console.error('register error', err)
      return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'SERVER_ERROR', message: 'Could not create account. Try again.' },
      })
    }
  },

  async login(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'email and password are required.' },
      })
    }

    try {
      const resident = await Resident.findByEmail(email)
      if (!resident) {
        return res.status(401).json({
          success: false,
          data: null,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        })
      }

      const valid = await bcrypt.compare(password, resident.password)
      if (!valid) {
        return res.status(401).json({
          success: false,
          data: null,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        })
      }

      const token = issueToken(resident)

      return res.json({
        success: true,
        data: {
          token,
          resident: { id: resident.id, handle: resident.handle, email: resident.email },
        },
        error: null,
      })
    } catch (err) {
      console.error('login error', err)
      return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'SERVER_ERROR', message: 'Could not sign in. Try again.' },
      })
    }
  },

  async me(req, res) {
    try {
      const resident = await Resident.findById(req.resident.id)
      if (!resident) {
        return res.status(404).json({
          success: false,
          data: null,
          error: { code: 'NOT_FOUND', message: 'Resident not found.' },
        })
      }
      return res.json({ success: true, data: { resident }, error: null })
    } catch (err) {
      console.error('me error', err)
      return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'SERVER_ERROR', message: 'Could not fetch profile.' },
      })
    }
  },
}

module.exports = authController
