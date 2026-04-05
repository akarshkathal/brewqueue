import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import pool from './config/db'

const PORT = process.env.PORT || 3001

// Start the HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
// When you press Ctrl+C or the server gets a kill signal,
// we close the database pool cleanly before exiting
// This prevents data corruption and connection leaks
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    pool.end()
    process.exit(0)
  })
})

export default server