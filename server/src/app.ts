import express from 'express'
import cors from 'cors'
import queueRoutes from './routes/queueRoutes'

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BrewQueue server is running',
    timestamp: new Date().toISOString()
  })
})

// Mount queue routes
// Any request to /api/queue/... will be handled by queueRoutes
app.use('/api/queue', queueRoutes)

export default app