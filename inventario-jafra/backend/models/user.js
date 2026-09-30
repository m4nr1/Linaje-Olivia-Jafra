const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'admin' // Por Ahora todos serán Administradores
  }
}, { timestamps: true });

// Interceptor: Encriptar la contraseña antes de hacer el "save"
userSchema.pre('save', async function() {
  // Si la contraseña no ha sido modificada, terminamos la ejecución aquí
  if (!this.isModified('password')) {
    return;
  }
  // Generamos una "sal" (salt) de 10 rondas y encriptamos
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método Propio para Comparar la Contraseña del Login con la de la BD
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);