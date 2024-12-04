import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID del remitente
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID del destinatario
    message: { type: String, required: true }, // Contenido del mensaje
  },
  { timestamps: true } // Esto agrega `createdAt` y `updatedAt` automáticamente
);

export default mongoose.model('Message', messageSchema);
