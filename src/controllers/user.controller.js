import * as userService from '../services/user.service.js';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/mailer.js';
import { generateVerificationCode } from '../utils/verification.js';
import User from '../models/user.model.js';

/**
 * Registro de usuario
 */
export const register = async (req, res) => {
  const { name, email, password, photo, role } = req.body;

  try {
    const verificationCode = generateVerificationCode();

    const user = await userService.registerUser({
      name,
      email,
      password,
      photo, 
      role,
      verificationCode,
    });

    await sendVerificationEmail(email, verificationCode);
    console.log('Código enviado por correo:', verificationCode); 

    res.status(201).json({
      message: 'Usuario registrado, por favor revisa tu correo para verificar tu cuenta.',
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(400).json({ message: error.message });
  }
};
/**
 * Verificación de correo electrónico
 */
export const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const isVerified = await userService.verifyUserEmail(email, verificationCode);

    if (!isVerified) {
      return res.status(400).json({ message: 'Código de verificación incorrecto o expirado.' });
    }

    res.status(200).json({ message: 'Correo verificado exitosamente.' });
  } catch (error) {
    console.error("Error al verificar correo:", error);
    res.status(500).json({ message: error.message });
  }
};
/**
 * Inicio de sesión
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Autenticación del usuario con el servicio de login
    const user = await userService.loginUser({ email, password });

    // Generación del token con información adicional (name, email, role, photo)
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,               // Incluir el nombre del usuario
        role: user.role,               // Incluir el rol del usuario
        email: user.email,             // Incluir el correo electrónico
        profileImageUrl: user.photo || 'default_image_url',  // Incluir la foto de perfil (o una por defecto)
      },
      process.env.JWT_SECRET,         // Clave secreta para firmar el token
      { expiresIn: '1h' }             // Expiración del token (1 hora en este caso)
    );

    // Responder con el token y los datos del usuario
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo || 'default_image_url',
      },
      token, // Incluir el token JWT
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Validación de token JWT
 */
export const verifyToken = (req, res) => {
  res.status(200).json({ message: 'Token válido.' });
};

export const getUserProfile = (req, res) => {
  try {
      console.log('User info from middleware:', req.user);

      if (!req.user) {
          return res.status(400).json({ message: "User data not found" });
      }

      const { id, name, role, email, profileImageUrl } = req.user;

      return res.json({
          id,
          name,
          role,
          email,
          profileImageUrl
      });
  } catch (error) {
      console.error('Error in getUserProfile:', error);
      return res.status(500).json({ message: "Internal server error" });
  }
};



export const getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await userService.getUsersWithPendingRequests();

    if (!pendingRequests || pendingRequests.length === 0) {
      return res.status(404).json({ message: 'No hay solicitudes pendientes.' });
    }

    res.json(pendingRequests);
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (req, res) => {
  const { id } = req.params;  

  try {
    const user = await User.findById(id);

    if (!user) {
      console.error("Usuario no encontrado con ID:", id);
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (user.roleRequest.status !== 'pending') {
      console.error("La solicitud no está pendiente:", user.roleRequest.status);
      return res.status(400).json({ message: 'La solicitud ya ha sido procesada o no está en estado pendiente.' });
    }

    user.role = 'instructor';

    user.roleRequest.status = 'approved';
    user.roleRequest.responseDate = new Date();

    // Guardamos los cambios en la base de datos
    await user.save();

    res.status(200).json({
      message: 'Solicitud aprobada con éxito.',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        roleRequest: user.roleRequest,
      },
    });
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({ message: 'Hubo un error al intentar aprobar la solicitud.' });
  }
};

export const requestRoleChange = async (req, res) => {
  const { cum } = req.body;
  const userId = req.user._id; // ID del usuario extraído del middleware

  if (cum < 0 || cum > 10) {
    return res.status(400).json({ message: "El CUM debe estar entre 0 y 10." });
  }

  try {
    // Actualizamos la solicitud de rol del usuario
    const user = await User.findByIdAndUpdate(
      userId,
      {
        "roleRequest.cum": cum,
        "roleRequest.status": "pending",
        "roleRequest.requestDate": new Date(),
      },
      { new: true } // Retorna el documento actualizado
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json({
      message: "Solicitud enviada con éxito.",
      user: {
        id: user._id,
        name: user.name,
        roleRequest: user.roleRequest,
      },
    });
  } catch (error) {
    console.error("Error actualizando la solicitud:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Buscar todos los usuarios en la base de datos
    const users = await User.find();  // .find() devuelve todos los usuarios
    res.status(200).json(users);  // Devuelve los usuarios como respuesta
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ message: 'Hubo un error al obtener los usuarios.' });
  }
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;  // Recibimos el ID del usuario a eliminar

  try {
    // Buscamos al usuario por su ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificamos si el usuario a eliminar es un administrador
    if (user.role === 'admin') {
      // Verificamos cuántos administradores existen en la base de datos
      const adminCount = await User.countDocuments({ role: 'admin' });

      if (adminCount <= 1) {
        return res.status(400).json({ message: "No puedes eliminar al único administrador." });
      }
    }

    // Eliminamos al usuario
    await User.findByIdAndDelete(id);

    // Respondemos con un mensaje de éxito
    res.status(200).json({ message: 'Usuario eliminado con éxito.' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Hubo un error al intentar eliminar al usuario.' });
  }
};

export const changeUserRole = async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  try {
    // Verificar que el rol es válido
    if (!['student', 'instructor', 'catedratico'].includes(role)) {
      return res.status(400).json({ message: 'Rol no válido.' });
    }

    // Verificar si el usuario es un admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para cambiar el rol.' });
    }

    // Buscar al usuario por ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Cambiar el rol del usuario
    user.role = role;
    await user.save();

    return res.status(200).json({ message: 'Rol actualizado correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};




export const createAdmin = async (req, res) => {
  const { secretKey, name, email, password, photo } = req.body;

  // Verificamos que la clave secreta sea correcta
  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: 'Acceso denegado. Clave secreta incorrecta.' });
  }

  try {
    // Registramos al admin directamente con isVerified: true
    const admin = await userService.registerUser({
      name,
      email,
      password,
      photo,
      role: 'admin', // Aseguramos que tenga el rol de admin
      isVerified: true, // No requiere verificación adicional, se crea como verificado
    });

    // Respondemos con el éxito
    res.status(201).json({
      message: 'Admin creado exitosamente.',
      user: admin,
    });
  } catch (error) {
    console.error("Error al crear admin:", error);
    res.status(400).json({ message: error.message });
  }
};
