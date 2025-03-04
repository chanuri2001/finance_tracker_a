const request = require("supertest");
const app = require("../server");
const { generateToken } = require("../utils/jwtUtils");

describe("🔹 Role-Based Dashboard API Tests", () => {
  let adminToken;

  beforeAll(async () => {
    const adminUser = {
      _id: "604cb554311d68f491ba5782",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    };

    adminToken = generateToken(adminUser._id, adminUser.role); // Ensure role is included
  });

  test("✅ Admin should get system-wide dashboard", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    console.log("🔍 Admin Dashboard Response:", res.body); // Debugging

    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe("admin"); // Ensure role is admin
    expect(res.body.data).toHaveProperty("totalUsers");
    expect(res.body.data).toHaveProperty("totalTransactions");
  });
});
