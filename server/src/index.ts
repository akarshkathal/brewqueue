import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import app from './app'
import pool from './config/db'
import { setupSocketHandlers } from './socket/socketHandler'

const PORT = process.env.PORT || 3001

// Create an HTTP server from our Express app
// We need this so Socket.io and Express share the same server
const server = http.createServer(app)

// Attach Socket.io to the HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
})

// Set up all socket event handlers
setupSocketHandlers(io)

// Make io accessible from controllers
// We attach it to the app so controllers can emit events
app.set('io', io)

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/health`)
  console.log(`🔌 Socket.io ready`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    pool.end()
    process.exit(0)
  })
})

export { io }
export default server