const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    socket.join(`user:${socket.userId}`);
    socket.join('admin');
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const emitToUser = (userId, event, data) => {
  try {
    const socketIO = getIO();
    socketIO.to(`user:${userId}`).emit(event, data);
  } catch (error) {
    console.error('WebSocket emit error:', error);
  }
};

const emitToAdmin = (event, data) => {
  try {
    const socketIO = getIO();
    socketIO.to('admin').emit(event, data);
  } catch (error) {
    console.error('WebSocket admin emit error:', error);
  }
};

const emitToAll = (event, data) => {
  try {
    const socketIO = getIO();
    socketIO.emit(event, data);
  } catch (error) {
    console.error('WebSocket broadcast error:', error);
  }
};

module.exports = { initWebSocket, getIO, emitToUser, emitToAdmin, emitToAll };