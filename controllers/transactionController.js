const Transaction = require('../models/Transaction');

// 🔹 Add a New Transaction
exports.addTransaction = async (req, res) => {
    try {
        const { amount, category, type } = req.body;
        const transaction = new Transaction({ 
            user: req.user.id, 
            amount, 
            category, 
            type 
        });

        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Get All Transactions for the User
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Filter Transactions by Type, Category, or Date
exports.filterTransactions = async (req, res) => {
    try {
        const { type, category, startDate, endDate } = req.query;
        let filter = { user: req.user.id };

        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const transactions = await Transaction.find(filter);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Update a Transaction
exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Delete a Transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
