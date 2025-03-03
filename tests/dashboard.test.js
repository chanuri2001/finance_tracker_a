const request = require("supertest");
const app = require("../server"); // Import Express app
const User = require("../models/User");
const { generateToken } = require("../utils/jwtUtils"); // JWT Helper function

describe("🔹 Role-Based Dashboard API Tests", () => {
  let adminToken, userToken;

  beforeAll(async () => {
    // 🔹 Delete existing users before inserting new ones
    await User.deleteMany({ email: { $in: ["admin@example.com", "user@example.com"] } });

    const admin = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",  // ✅ Ensure Role is Admin
    });

    const user = await User.create({
        name: "Regular User",
        email: "user@example.com",
        password: "password123",
        role: "user",  // ✅ Ensure Role is User
    });

    adminToken = generateToken(admin._id, "admin"); // ✅ Include Role in Token
    userToken = generateToken(user._id, "user");   // ✅ Include Role in Token
});



  test("✅ Admin should get system-wide dashboard", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe("admin");
    expect(res.body.data).toHaveProperty("totalUsers");
    expect(res.body.data).toHaveProperty("totalTransactions");
  });

  test("✅ Regular user should get personal dashboard", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe("user");
    expect(res.body.data).toHaveProperty("recentTransactions");
    expect(res.body.data).toHaveProperty("budgets");
  });

  test("❌ Should return 401 for unauthorized access", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Not authorized/);

  });
});
