const Transaction = require('../models/Transaction');

// 🔹 Add a Transaction
exports.addTransaction = async (req, res) => {
    try {
        const { amount, category, type, tags, isRecurring, recurrencePattern, endDate } = req.body;

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }

        const transaction = new Transaction({
            user: req.user.id,
            amount,
            category,
            type,
            tags,
            isRecurring,
            recurrencePattern,
            endDate
        });

        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Get All Transactions for Logged-in User
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Filter Transactions by Type, Category, or Tag
exports.filterTransactions = async (req, res) => {
    try {
        const { type, category, tag } = req.query;
        let query = { user: req.user.id };

        if (type) query.type = type;
        if (category) query.category = category;
        if (tag) query.tags = tag;

        const transactions = await Transaction.find(query);
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Update a Transaction
const mongoose = require('mongoose');


exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔹 Validate if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid transaction ID format' });
        }

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        Object.assign(transaction, req.body);
        await transaction.save();

        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Delete a Transaction
exports.deleteTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await transaction.deleteOne();
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
