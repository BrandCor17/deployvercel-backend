import User from '../models/user.model.js';

const cleanUnverifiedUsers = async () => {
  try {
    const now = new Date();
    const result = await User.deleteMany({ isVerified: false, expiresAt: { $lt: now } });
    console.log(`Usuarios no verificados eliminados: ${result.deletedCount}`);
  } catch (error) {
    console.error('Error al eliminar usuarios no verificados:', error);
  }
};

export default cleanUnverifiedUsers;
