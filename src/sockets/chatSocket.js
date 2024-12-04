
const handleChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    socket.on('privateMessage', async (data) => {
      const { sender, recipient, message } = data;

      try {
        const newMessage = new Message({
          sender,
          recipient,
          message,
        });
        await newMessage.save();

        io.to(recipient).emit('privateMessage', {
          sender,
          recipient,
          message,
        });
      } catch (error) {
        console.error('Error al guardar o enviar el mensaje:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });
};

export default handleChatSocket;