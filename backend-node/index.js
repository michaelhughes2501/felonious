const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'API is live' })
})

// API routes
app.use(require('./routes/kits'))
app.use(require('./routes/connects'))
app.use(require('./routes/assistant'))
app.use(require('./routes/items'))

// Serve built React frontend in production (public/ exists after `npm run build`)
const publicDir = path.join(__dirname, 'public')
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir))
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'))
  })
}

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Node server live on port ${PORT}`))
