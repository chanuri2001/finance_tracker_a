const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

exports.generateReport = async (req, res) => {
    try {
        console.log("🔹 Debug: Entering generateReport function");

        const { startDate, endDate, category, tag } = req.query;

        let matchQuery = { user: new mongoose.Types.ObjectId(req.user.id) };

        // 🔹 Filter by Date Range (Optional)
        if (startDate && endDate) {
            matchQuery.date = { 
                $gte: new Date(startDate), 
                $lte: new Date(endDate) 
            };
        }

        // 🔹 Filter by Category (Optional)
        if (category) {
            matchQuery.category = category;
        }

        // 🔹 Filter by Tag (Optional)
        if (tag) {
            matchQuery.tags = tag;
        }

        console.log("🔹 Query Filters:", matchQuery);

        // 🔹 Aggregate Data for Income & Expenses
        const transactions = await Transaction.aggregate([
            { $match: matchQuery },
            { 
                $group: { 
                    _id: "$type", 
                    total: { $sum: "$amount" } 
                } 
            }
        ]);

        // 🔹 Structure Data into JSON Response
        let report = { income: 0, expense: 0 };
        transactions.forEach(t => {
            report[t._id] = t.total;
        });

        // 🔹 Calculate Balance
        report.balance = (report.income || 0) - (report.expense || 0);

        console.log("✅ Report Generated:", report);
        res.json(report);
    } catch (error) {
        console.error("❌ Error in generateReport:", error);
        res.status(500).json({ error: "Server error" });
    }
};
