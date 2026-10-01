const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['entrada', 'venta'],
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1 
  },
  notes: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);