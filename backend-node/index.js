const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ message: 'API is live' })
})

app.use(require('./routes/kits'))
app.use(require('./routes/connects'))
app.use(require('./routes/assistant'))

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Node server live on port ${PORT}`))
