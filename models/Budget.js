const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true }, // e.g., Food, Transport
    amount: { type: Number, required: true }, // Budgeted amount
    spent: { type: Number, default: 0 }, // Track spending
    month: { type: String, required: true }, // Format: YYYY-MM (e.g., 2025-03)
}, { timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);
