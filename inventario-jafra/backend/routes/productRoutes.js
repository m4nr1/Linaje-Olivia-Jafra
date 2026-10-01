const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Definición de endpoints para el módulo de inventario
router.post('/', protect, productController.createProduct);          // POST /api/products
router.get('/', productController.getProducts);           // GET /api/products
router.put('/:id', productController.updateProduct);      // PUT /api/products/:id
router.delete('/:id', productController.deleteProduct);   // DELETE /api/products/:id

module.exports = router;