import express from 'express'
import cors from 'cors'

const app = express()

// MIDDLEWARE
// Middleware are functions that run on every request
// before it reaches your route handlers

// cors() allows your React frontend (running on localhost:5173)
// to make requests to your backend (running on localhost:3001)
// Without this, the browser blocks cross-origin requests
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

// express.json() parses incoming request bodies as JSON
// Without this, req.body would be undefined when a
// client sends JSON data (like a form submission)
app.use(express.json())

// Health check route
// This is a standard pattern — a simple endpoint that
// tells you the server is alive and running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BrewQueue server is running',
    timestamp: new Date().toISOString()
  })
})

export default app