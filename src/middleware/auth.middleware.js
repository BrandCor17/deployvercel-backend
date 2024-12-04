// authMiddleware.js
import jwt from 'jsonwebtoken';
import { config } from '../config/db.config.js';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret); // Verificar el token

    if (!decoded.id) {
      return res.status(400).json({ message: 'Invalid token. User ID missing.' });
    }

    // Aquí añades más información del usuario al objeto req.user
    req.user = { 
      _id: decoded.id, 
      role: decoded.role, 
      email: decoded.email,            // Añadir email
      name: decoded.name,              // Añadir nombre
      profileImageUrl: decoded.profileImageUrl // Añadir URL de imagen de perfil
    };

    next(); // Continuar con el siguiente middleware o función (como getUserProfile)
  } catch (error) {
    console.error("Error de validación de token:", error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;
