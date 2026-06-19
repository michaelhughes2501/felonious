const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

/**
 * requireAuth — verifies the Bearer token in Authorization header.
 * Attaches req.resident = { id, handle } on success.
 */
function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required.' },
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.resident = decoded
    next()
  } catch {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'AUTH_INVALID', message: 'Token is invalid or expired. Please sign in again.' },
    })
  }
}

/**
 * optionalAuth — attaches req.resident if a valid token is present,
 * but does not block the request if absent.
 */
function optionalAuth(req, res, next) {
  const header = req.headers['authorization'] || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    try {
      req.resident = jwt.verify(token, JWT_SECRET)
    } catch {
      // ignore invalid token in optional mode
    }
  }
  next()
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET }
