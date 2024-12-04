import { Server as socketIo } from 'socket.io';

export const createSocketServer = (server) => {
  const io = new socketIo(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
    },
  });

  io.on('connection', (socket) => {
    console.log('Un nuevo usuario se ha conectado');

    // Escuchar los mensajes entrantes
    socket.on('chatMessage', (message) => {
      console.log('Mensaje recibido:', message);
      io.emit('chatMessage', message);
    });

    // Escuchar cuando el usuario se desconecta
    socket.on('disconnect', () => {
      console.log('Un usuario se ha desconectado');
    });
  });

  return io;
};
