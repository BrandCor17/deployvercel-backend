import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Registrar un nuevo usuario (no se guarda hasta que el correo esté verificado)
 */
export const registerUser = async ({ name, email, password, photo, role, verificationCode }) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Este correo ya está registrado');
    }

    const user = new User({
      name,
      email,
      password, 
      photo,  
      role,
      verificationCode,
      isVerified: false,  
    });


    console.log('Usuario registrado:', user);
    return user; 
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    throw new Error('Hubo un error al registrar al usuario.');
  }
};


/**
 * Buscar un usuario por correo
 */
export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 * Verificar el código de verificación del correo
 */
export const verifyUserEmail = async (email, verificationCode) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificamos el código de verificación
    if (user.verificationCode !== verificationCode) {
      return false;
    }

    user.isVerified = true;
    user.verificationCode = ''; 
    await user.save();

    console.log('Usuario verificado:', user);
    return true; 
  } catch (error) {
    console.error("Error al verificar el correo:", error);
    throw new Error('Hubo un error al verificar el correo.');
  }
};


/**
 * Autenticar usuario (login)
 */
export const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    console.log(`Usuario verificado: ${user.isVerified}`);
    
    if (!user.isVerified) {
      throw new Error('Por favor, verifica tu cuenta antes de iniciar sesión.');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
      token,
    };
  } catch (error) {
    console.error("Error al autenticar usuario:", error);
    throw new Error('Error al iniciar sesión.');
  }
};



export const getUsersWithPendingRequests = async () => {
  try {
    return await User.find(
      { "roleRequest.status": "pending" },
      { name: 1, "roleRequest._id": 1, "roleRequest.cum": 1 } 
    ).lean();  
  } catch (error) {
    console.error("Error al consultar solicitudes pendientes:", error);
    throw new Error("Error al consultar solicitudes pendientes.");
  }
};





export const approveUserRequest = async (id) => {
  try {
    const user = await User.findOne({ 'roleRequest._id': id });

    if (!user) {
      return null;
    }

    if (user.roleRequest.status !== 'pending') {
      return { message: 'La solicitud ya ha sido procesada o no está en estado pendiente.' };
    }

    user.role = 'instructor';

    user.roleRequest.status = 'approved';
    user.roleRequest.responseDate = new Date();

    await user.save();

    return user;
  } catch (error) {
    console.error('Error al procesar la solicitud de aprobación:', error);
    throw new Error('Hubo un error al procesar la solicitud.');
  }
};





export const changeRoleService = async (userId, role) => {
  if (!['student', 'instructor', 'catedratico'].includes(role)) {
    throw new Error('Rol no válido.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado.');
  }

  user.role = role;
  await user.save();
  
  return user;
};


