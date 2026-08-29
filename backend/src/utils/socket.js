import { Server } from 'socket.io';

class SocketService {
  constructor() {
    this.io = null;
    this.users = new Map(); // Map userId -> socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log('🔌 New socket connection:', socket.id);

      socket.on('join', (userId) => {
        if (userId) {
          this.users.set(userId.toString(), socket.id);
          console.log(`👤 User ${userId} joined room`);
        }
      });

      socket.on('disconnect', () => {
        // Find and remove user from map
        for (let [userId, socketId] of this.users.entries()) {
          if (socketId === socket.id) {
            this.users.delete(userId);
            break;
          }
        }
        console.log('🔌 Socket disconnected:', socket.id);
      });
    });
  }

  emitToUser(userId, event, data) {
    const socketId = this.users.get(userId.toString());
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }
}

export const socketService = new SocketService();
