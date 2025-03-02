const Budget = require('../models/Budget');

// 🔹 Create a Budget
exports.addBudget = async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;
        const budget = new Budget({ user: req.user.id, category, amount, month, year });
        await budget.save();
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Get Budgets for the User
exports.getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Update a Budget
exports.updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );

        if (!budget) return res.status(404).json({ error: 'Budget not found' });

        res.json(budget);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Delete a Budget
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!budget) return res.status(404).json({ error: 'Budget not found' });

        res.json({ message: 'Budget deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
