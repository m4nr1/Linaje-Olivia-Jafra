const Product = require('../models/Product');

// 1. CREAR (REGISTRAR) un producto (CREATE)
exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ 
      success: true, 
      message: '🟢 Producto Registrado Exitosamente en el Inventario', 
      product: newProduct 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: '🔴 Error al Registrar el Producto (Verifica si el SKU ya Existe)', 
      error: error.message 
    });
  }
};

// 2. OBTENER todos los Productos (READ)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: products.length, 
      products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '🔴 Error al Obtener el Catálogo de Productos', 
      error: error.message 
    });
  }
};

// 3. ACTUALIZAR un producto por ID (UPDATE)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: '🟡 Producto no Encontrado' });
    }

    res.status(200).json({ 
      success: true, 
      message: '🟢 Producto Actualizado Correctamente', 
      product: updatedProduct 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: '🔴 Error al Actualizar el Producto', 
      error: error.message 
    });
  }
};

// 4. ELIMINAR un producto por ID (DELETE)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: '🟡 Producto no Encontrado' });
    }

    res.status(200).json({ 
      success: true, 
      message: '🟢 Producto Eliminado del Inventario de Forma Exitosa' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '🔴 Error al Intentar Eliminar el Producto', 
      error: error.message 
    });
  }
};