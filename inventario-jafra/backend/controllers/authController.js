const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Generador de Tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // El Token Expirará en 30 Días
  });
};

// 1. REGISTRAR un Nuevo Usuario
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el Correo ya Está Registrado
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: '🟡 El Usuario ya Existe' });
    }

    // Crear y Guardar el Usuario
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '🔴 Error al registrar usuario', error: error.message });
  }
};

// 2. INICIAR SESIÓN (Login)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar al Usuario por Correo
    const user = await User.findOne({ email });

    // Verificar que el Usuario Exista y la Contraseña Coincida Usando Nuestro Método del Modelo
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ success: false, message: '🔴 Correo o Contraseña Incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '🔴 Error en el Servidor Durante el Login', error: error.message });
  }
};