const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Import Routes
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
/*const categoryRoutes = require('./routes/categoryRoutes'); // ✅ Category Management*/
const budgetRoutes = require('./routes/budgetRoutes'); // ✅ Budget Management
const reportRoutes = require("./routes/reportRoutes");
const goalRoutes = require("./routes/goalRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
// 🔹 Use Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
/*app.use('/api/categories', categoryRoutes); // ✅ Enable Category API*/
app.use('/api/budgets', budgetRoutes); // ✅ Enable Budget API
app.use("/api/reports", reportRoutes); 
app.use("/api/goals", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);




if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; // Export the app for testing

