import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('El correo debe ser válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
