const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'API is live' })
})

// API routes
app.use(require('./routes/auth'))
app.use(require('./routes/kits'))
app.use(require('./routes/connects'))
app.use(require('./routes/assistant'))
app.use(require('./routes/items'))

// Ensure residents table exists (runs async, non-blocking)
const Resident = require('./models/Resident')
Resident.ensureTable().catch(err => console.warn('Could not create residents table:', err.message))

// Serve built React frontend in production (public/ exists after `npm run build`)
const publicDir = path.join(__dirname, 'public')
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir))
  app.get('*splat', (req, res) => {
    // If the request is for the API but wasn't caught by routes, return 404
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' })
    }
    const indexPath = path.join(publicDir, 'index.html')
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath)
    }
    res.status(404).json({ error: 'Frontend entry point (index.html) not found in /public' })
  })
}

// Fallback route for / if the public directory is missing
app.get('/', (req, res) => {
  res.json({ message: 'Felonious Backend is running. (Frontend build not found in /public)' })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal Server Error' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Node server live on port ${PORT}`)
  if (!fs.existsSync(publicDir)) console.warn('Note: "public" directory not found. The frontend will not be served.')
})
