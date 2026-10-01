const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Verificamos si la Petición trae un Encabezado de Autorización y si Empieza con "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 2. Desencriptamos y Verificamos la Validez del Token con Nuestra LLave Maestra
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Buscamos al Usuario Dueño del Token en la Base de Datos
      req.user = await User.findById(decoded.id).select('-password');

      // 4. Todo en Orden, le Cedemos el Paso al Controlador de Productos
      next(); 
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: '🔴 NO AUTORIZADO, el Token es Inválido o ha Expirado.' });
    }
  }

  // Si después de revisar los encabezados no encontramos ningún token:
  if (!token) {
    res.status(401).json({ success: false, message: '🔴 ACCESO DENEGADO, no se Proporcionó un Token de Seguridad.' });
  }
};

module.exports = { protect };