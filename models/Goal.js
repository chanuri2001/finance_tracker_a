const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },  // e.g., "Save for Car"
    targetAmount: { type: Number, required: true }, // Goal amount
    savedAmount: { type: Number, default: 0 }, // Track current savings
    deadline: { type: Date, required: true }, // Goal completion date
    autoAllocate: { type: Boolean, default: false }, // ✅ Automatically allocate savings from income
}, { timestamps: true });

module.exports = mongoose.model("Goal", GoalSchema);
