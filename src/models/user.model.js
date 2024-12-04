import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2 },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  },
  password: { type: String, required: true, minlength: 8 },
  photo: { type: String, default: 'https://cdn.icon-icons.com/icons2/1916/PNG/512/person_121780.png' },
  role: { 
    type: String, 
    enum: ['student', 'instructor', 'catedratico', 'admin'], 
    default: 'student' 
  },
  coursesAsStudent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  coursesAsInstructor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  coursesAsCatedratico: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  roleRequest: {
    requestedRole: { 
      type: String, 
      enum: ['instructor'], 
      default: null 
    },
    cum: { 
      type: Number, 
      min: 0, 
      max: 10, 
      required: false,
      default: 0.00
    },
    status: { 
      type: String, 
      enum: ['notSent', 'pending', 'approved', 'rejected'], 
      default: 'notSent' 
    },
    requestDate: { type: Date }, 
    responseDate: { type: Date } 
  },
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Middleware para actualizar el timestamp en findOneAndUpdate
userSchema.pre('findOneAndUpdate', function (next) {
  this._update.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
