const mongoose = require("mongoose");
const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");

// 🔹 1. Set a Goal (POST /api/goals)
exports.createGoal = async (req, res) => {
    try {
        const { name, targetAmount, deadline, autoAllocate } = req.body;

        const goal = new Goal({ 
            user: req.user.id, 
            name, 
            targetAmount, 
            deadline, 
            autoAllocate 
        });

        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        console.error("❌ Error creating goal:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// 🔹 2. Get All Goals (GET /api/goals)
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id });
        res.json(goals);
    } catch (error) {
        console.error("❌ Error fetching goals:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// 🔹 3. Update Goal Progress (PUT /api/goals/:id)
exports.updateGoal = async (req, res) => {
    try {
        const { savedAmount } = req.body;
        let goal = await Goal.findById(req.params.id);

        if (!goal) return res.status(404).json({ error: "Goal not found" });

        if (goal.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        goal.savedAmount += savedAmount;
        await goal.save();

        res.json(goal);
    } catch (error) {
        console.error("❌ Error updating goal:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// 🔹 4. Delete a Goal (DELETE /api/goals/:id)
exports.deleteGoal = async (req, res) => {
    try {
        let goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ error: "Goal not found" });

        if (goal.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        await goal.deleteOne();
        res.json({ message: "Goal deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting goal:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// 🔹 5. Automatic Savings Allocation (Triggered on New Income)
exports.autoAllocateSavings = async (userId, incomeAmount) => {
    try {
        const goals = await Goal.find({ user: userId, autoAllocate: true });

        if (goals.length === 0) return; // No goals set for auto-allocation

        const totalGoalAmount = goals.reduce((sum, goal) => sum + (goal.targetAmount - goal.savedAmount), 0);

        for (let goal of goals) {
            const allocateAmount = (incomeAmount * (goal.targetAmount - goal.savedAmount)) / totalGoalAmount;
            goal.savedAmount += allocateAmount;
            await goal.save();
        }

        console.log(`✅ Auto-allocated savings from income of ${incomeAmount}`);
    } catch (error) {
        console.error("❌ Error in auto savings allocation:", error);
    }
};
