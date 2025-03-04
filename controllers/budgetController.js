const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require("mongoose");

// 🔹 1. Set a Budget (POST /api/budgets)
const setBudget = async (req, res) => {
    try {
        const { category, amount, month } = req.body;

        if (!category || !amount || !month) {
            return res.status(400).json({ error: "Category, amount, and month are required." });
        }

        let budget = await Budget.findOne({ user: req.user.id, category, month });

        if (budget) {
            return res.status(400).json({ error: 'Budget for this category and month already exists' });
        }

        budget = new Budget({ user: req.user.id, category, amount, month });
        await budget.save();

        res.status(201).json(budget);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 2. Get User Budgets (GET /api/budgets)
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });
        res.json(budgets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 3. Update a Budget (PUT /api/budgets/:id)
const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid budget ID format" });
        }

        let budget = await Budget.findById(id);
        if (!budget) return res.status(404).json({ error: 'Budget not found' });

        if (budget.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        budget.amount = amount ?? budget.amount;
        await budget.save();

        res.json(budget);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 4. Delete a Budget (DELETE /api/budgets/:id)
const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid budget ID format" });
        }

        let budget = await Budget.findById(id);
        if (!budget) return res.status(404).json({ error: 'Budget not found' });

        if (budget.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await budget.deleteOne();
        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 5. Get Budget Alerts (GET /api/budgets/alerts)
const budgetAlerts = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });

        let alerts = [];

        for (const budget of budgets) {
            const totalSpent = await Transaction.aggregate([
                { $match: { user: req.user.id, category: budget.category, month: budget.month } },
                { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
            ]);

            const spent = totalSpent.length > 0 ? totalSpent[0].totalAmount : 0;
            const remaining = budget.amount - spent;

            if (remaining < 0) {
                alerts.push({ category: budget.category, message: `Budget exceeded by $${Math.abs(remaining)}` });
            } else if (remaining < budget.amount * 0.2) {
                alerts.push({ category: budget.category, message: `You're close to exceeding your budget!` });
            }
        }

        res.json(alerts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 6. Get Budget Recommendations (GET /api/budgets/recommendations)
const budgetRecommendations = async (req, res) => {
    try {
        const transactions = await Transaction.aggregate([
            { $match: { user: req.user.id } },
            { $group: { _id: "$category", totalSpent: { $sum: "$amount" } } },
            { $sort: { totalSpent: -1 } }
        ]);

        let recommendations = transactions.map(transaction => ({
            category: transaction._id,
            suggestedBudget: Math.ceil(transaction.totalSpent * 1.1)  // Suggesting 10% more than last month’s spending
        }));

        res.json(recommendations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ Ensure functions are exported correctly
module.exports = {
    setBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
    budgetAlerts,
    budgetRecommendations
};
