const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require("mongoose");

// 🔹 1. Set a Budget (POST /api/budgets)
exports.setBudget = async (req, res) => {
    try {
        const { category, amount, month } = req.body;

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
exports.getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });
        res.json(budgets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 3. Update a Budget (PUT /api/budgets/:id)
exports.updateBudget = async (req, res) => {
    try {
        const { amount } = req.body;

        let budget = await Budget.findById(req.params.id);
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
exports.deleteBudget = async (req, res) => {
    try {
        let budget = await Budget.findById(req.params.id);
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

// 🔹 5. Budget Alerts (GET /api/budgets/alerts)
exports.budgetAlerts = async (req, res) => {
    try {
        console.log("🔹 Debug: Entering budgetAlerts function");

        const budgets = await Budget.find({ user: req.user.id });

        // 🔹 Ensure each category is checked only once
        const uniqueBudgets = {};
        budgets.forEach(budget => {
            if (!uniqueBudgets[budget.category]) {
                uniqueBudgets[budget.category] = budget;
            }
        });

        const alerts = [];
        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        for (let category in uniqueBudgets) {
            const budget = uniqueBudgets[category];
            console.log(`Checking budget for category: ${budget.category}`);

            const totalSpent = await Transaction.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(req.user.id),  
                        category: budget.category,
                        type: "expense",
                        date: { $gte: currentMonthStart, $lte: currentMonthEnd } // ✅ Count only this month’s transactions
                    }
                },
                { 
                    $group: { _id: null, total: { $sum: "$amount" } } 
                }
            ]);

            let spent = totalSpent.length > 0 ? totalSpent[0].total : 0;
            console.log(`Spent for ${budget.category}: ${spent}, Budgeted: ${budget.amount}`);

            if (spent >= budget.amount) {
                alerts.push({ category: budget.category, message: "⚠️ Budget exceeded!" });
            } else if (spent >= budget.amount * 0.8) {
                alerts.push({ category: budget.category, message: "⚠️ You are nearing your budget limit!" });
            } else if (spent >= budget.amount * 0.1) {
                alerts.push({ category: budget.category, message: "ℹ️ You're starting to spend in this category!" });
            }
        }

        if (alerts.length > 0) {
            console.log("✅ Alerts Generated:", alerts);
        } else {
            console.log("ℹ️ No budget alerts generated.");
        }

        res.json(alerts);
    } catch (error) {
        console.error("❌ Error in budgetAlerts:", error);
        res.status(500).json({ error: "Server error" });
    }
};
// 🔹 6. Budget Recommendations (GET /api/budgets/recommendations)
exports.budgetRecommendations = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });
        const recommendations = [];

        for (let budget of budgets) {
            const totalSpent = await Transaction.aggregate([
                { $match: { user: req.user.id, category: budget.category } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            let spent = totalSpent[0]?.total || 0;
            budget.spent = spent;
            await budget.save();

            if (spent > budget.amount) {
                recommendations.push({
                    category: budget.category,
                    message: `Consider increasing your budget to ${spent + 50}`
                });
            }
        }

        res.json(recommendations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
