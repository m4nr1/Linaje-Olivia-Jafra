const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['Entrada', 'Salida'] },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
