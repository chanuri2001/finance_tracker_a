const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

// 🔹 Admin Dashboard: Get system-wide overview
const getAdminDashboard = async () => {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    const financialSummary = await Transaction.aggregate([
        { 
            $group: { 
                _id: "$type", 
                totalAmount: { $sum: "$amount" } 
            } 
        }
    ]);

    let income = 0, expense = 0;
    financialSummary.forEach(entry => {
        if (entry._id === "income") income = entry.totalAmount;
        if (entry._id === "expense") expense = entry.totalAmount;
    });

    return { totalUsers, totalTransactions, income, expense, balance: income - expense };
};

// 🔹 User Dashboard: Get user-specific overview
const getUserDashboard = async (userId) => {
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 }).limit(5);
    const budgets = await Budget.find({ user: userId });
    const goals = await Goal.find({ user: userId });

    return { recentTransactions: transactions, budgets, goals };
};

// 🔹 Dashboard API Controller
exports.getDashboard = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            const adminData = await getAdminDashboard();
            return res.json({ role: "admin", data: adminData });
        } else {
            const userData = await getUserDashboard(req.user.id);
            return res.json({ role: "user", data: userData });
        }
    } catch (error) {
        console.error("❌ Error fetching dashboard:", error);
        res.status(500).json({ error: "Server error" });
    }
};
