import express from 'express'
import cors from 'cors'
import queueRoutes from './routes/queueRoutes'
import authRoutes from './routes/authRoutes'

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BrewQueue server is running',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/queue', queueRoutes)
app.use('/api/auth', authRoutes)

export default app