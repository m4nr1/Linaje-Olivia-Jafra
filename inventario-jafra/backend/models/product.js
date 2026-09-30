const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  stock: { type: Number, required: true, min: 0 },
  category: { type: String },
  price: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);