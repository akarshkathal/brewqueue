import { Server as SocketIOServer, Socket } from 'socket.io'
import * as queueService from '../services/queueService'

// This function sets up all socket event listeners
// It receives the io server instance and sets everything up
export function setupSocketHandlers(io: SocketIOServer) {

  // This runs every time a new client connects
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // When a client joins, they tell us which shop they're watching
    // We put them in a "room" for that shop
    // Rooms let us broadcast only to relevant clients
    // e.g. staff at Blue Bottle only get Blue Bottle updates
    socket.on('join:shop', (shopSlug: string) => {
      socket.join(shopSlug)
      console.log(`📋 Client ${socket.id} joined room: ${shopSlug}`)
    })

    // When a customer wants to watch their specific entry
    // We put them in a room just for their entry ID
    // So we can notify only THEM when they're called
    socket.on('join:entry', (entryId: string) => {
      socket.join(`entry:${entryId}`)
      console.log(`👤 Client ${socket.id} watching entry: ${entryId}`)
    })

    // Clean up when client disconnects
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`)
    })
  })
}

// These are helper functions called by our REST controllers
// after they update the database — they broadcast the change
// to all connected clients in the relevant room

// Broadcast updated queue to everyone watching this shop
export async function emitQueueUpdate(
  io: SocketIOServer,
  shopSlug: string,
  shopId: string
) {
  try {
    const queue = await queueService.getQueueByShopId(shopId)
    // io.to(shopSlug) targets only clients in that shop's room
    io.to(shopSlug).emit('queue:updated', { queue, total: queue.length })
  } catch (err) {
    console.error('emitQueueUpdate error:', err)
  }
}

// Notify a specific customer that it's their turn
export function emitEntryCalled(
  io: SocketIOServer,
  entryId: string,
  customerName: string
) {
  // io.to('entry:ENTRYID') targets only that customer's room
  io.to(`entry:${entryId}`).emit('entry:called', {
    message: `${customerName}, it's your turn!`,
    entryId
  })
}

// Broadcast shop open/closed status change
export function emitShopStatus(
  io: SocketIOServer,
  shopSlug: string,
  isOpen: boolean
) {
  io.to(shopSlug).emit('shop:status', { isOpen })
}