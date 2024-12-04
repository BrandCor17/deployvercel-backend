import messageModel from "../models/message.model.js";
const getMessages = async (req, res) => {
  const { userId, contactId } = req.params;

  try {
    const messages = await messageModel.find({
      $or: [
        { sender: userId, recipient: contactId },
        { sender: contactId, recipient: userId },
      ],
    }).sort({ createdAt: 1 }); 

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
};

const saveMessage = async (req, res) => {
  const { sender, recipient, message } = req.body;

  try {
    const newMessage = new messageModel({
      sender,
      recipient,
      message,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error al guardar el mensaje:', error);
    res.status(500).json({ message: 'Error al guardar el mensaje' });
  }
};

export {
  getMessages,
  saveMessage,
};
