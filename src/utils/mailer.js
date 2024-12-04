import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurar el transporte
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Verificar la conexión al servicio de correo
transporter.verify((error, success) => {
  if (error) {
    console.error('Error en el transporte de Nodemailer:', error);
  } else {
    console.log('Transporte de correo listo:', success);
  }
});

// Función para enviar el correo de verificación
export const sendVerificationEmail = (email, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '¡Estas a un paso de crear tu cuenta!',
    text: `Para verificar tu cuenta, usa este código: ${verificationCode}`,
  };

  return transporter.sendMail(mailOptions);
};
