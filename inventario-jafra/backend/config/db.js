const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🟢 Conectado Exitosamente a MongoDB Atlas');
  } catch (error) {
    console.error('🔴 Error al Conectar a MongoDB:', error);
    process.exit(1); // Detiene la app si la BD falla
  }
};

module.exports = connectDB;