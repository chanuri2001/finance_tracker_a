const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }, // ✅ Categorize expenses
    type: { type: String, enum: ['income', 'expense'], required: true },
    tags: [{ type: String }], // ✅ Allow multiple tags
    description: {
        type: String, // ✅ Add this field if missing
        required: false, // Optional, remove if you want it to be required
      },
    date: { type: Date, default: Date.now },
    isRecurring: { type: Boolean, default: false }, // ✅ Recurring flag
    recurrencePattern: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: null }, // ✅ Recurrence pattern
    endDate: { type: Date, default: null } // ✅ End date for recurring transactions
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
