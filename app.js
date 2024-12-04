import http from 'http';
import express from 'express';
import { connectToDatabase } from './src/config/database.js';
import { config } from './src/config/db.config.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSocketServer } from './src/config/socket.js';
import handleChatSocket from './src/sockets/chatSocket.js'; 

const app = express();

const server = http.createServer(app);

connectToDatabase()
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch(err => console.error('Error al conectar a la base de datos:', err));

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

import userRoutes from './src/routes/user.routes.js';
import courseRoutes from './src/routes/course.routes.js';
import eventRoutes from './src/routes/event.routes.js';
import messageRoutes from './src/routes/message.routes.js'; 
import { errorHandler } from './src/middleware/errorHandler.js';

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use(errorHandler);

const io = createSocketServer(server);
handleChatSocket(io);

server.listen(config.port, () => {
  console.log(`Servidor corriendo en el puerto ${config.port}`);
});
