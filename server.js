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

// 🔹 Use Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
/*app.use('/api/categories', categoryRoutes); // ✅ Enable Category API*/
app.use('/api/budgets', budgetRoutes); // ✅ Enable Budget API
app.use("/api/reports", reportRoutes); 



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
