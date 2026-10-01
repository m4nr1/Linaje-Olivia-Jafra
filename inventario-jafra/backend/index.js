const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Conectar a la Base de Datos en la nube
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Ruta de prueba general
app.get('/api', (req, res) => {
  res.json({ message: '🟢 API del Inventario funcionando al 100%' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor Corriendo en el Puerto ${PORT}`);
});