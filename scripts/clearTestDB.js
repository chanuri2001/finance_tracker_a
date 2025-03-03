const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");

const clearDatabase = async () => {
    try {
        await connectDB();
        await mongoose.connection.db.dropDatabase();
        console.log("✅ Test database cleared!");
        process.exit();
    } catch (error) {
        console.error("❌ Error clearing database:", error);
        process.exit(1);
    }
};

clearDatabase();
