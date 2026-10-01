const Transaction = require('../models/transaction');
const Product = require('../models/product'); 

exports.registerTransaction = async (req, res) => {
  try {
    const { productId, type, quantity, notes } = req.body;

    // 1. Buscar el Producto en la Base de Datos
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: '🔴 Producto no encontrado en el catálogo' });
    }

    // 2. Lógica Matemática de Inventario
    if (type === 'venta') {
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: `🔴 Stock insuficiente. Solo quedan ${product.stock} unidades.` });
      }
      product.stock -= quantity;
    } else if (type === 'entrada') {
      product.stock += quantity; 
    } else {
      return res.status(400).json({ success: false, message: '🔴 Tipo de movimiento inválido' });
    }

    // 3. Guardar el Nuevo Stock en el Producto
    await product.save();

    // 4. Crear el Comprobante (Historial) de la Transacción
    const transaction = await Transaction.create({
      product: productId,
      user: req.user._id, 
      type,
      quantity,
      notes
    });

    res.status(201).json({
      success: true,
      message: '🟢 Transacción Registrada y Stock Actualizado',
      newStock: product.stock,
      transaction
    });

  } catch (error) {
    res.status(500).json({ success: false, message: '🔴 Error al Procesar la Transacción', error: error.message });
  }
};