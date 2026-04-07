import { io, Socket } from 'socket.io-client'

const socket: Socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

export default socket