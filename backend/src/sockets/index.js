const { Server } = require('socket.io');

let io = null;

const parseCorsOrigins = () => {
  if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN.trim() === '*') {
    return '*';
  }

  return process.env.CORS_ORIGIN.split(',').map((value) => value.trim());
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: parseCorsOrigins(),
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.emit('socket:connected', {
      socketId: socket.id,
      connectedAt: new Date().toISOString(),
    });
  });

  return io;
};

const getIO = () => io;

const emitEvent = (eventName, payload) => {
  if (io) {
    io.emit(eventName, payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitEvent,
};
