const request = require("supertest");
const app = require("../server");
const { generateToken } = require("../utils/jwtUtils");

describe("🔹 User Management API Tests", () => {
  let userToken, adminToken;
  let uniqueEmail = `testuser${Date.now()}@example.com`; // Generate unique email for each test run

  beforeAll(async () => {
    const user = { _id: "604cb554311d68f491ba5781", role: "user" };
    const admin = { _id: "604cb554311d68f491ba5782", role: "admin" };

    userToken = generateToken(user._id);
    adminToken = generateToken(admin._id);
  });

  test("✅ User should register", async () => {
    const res = await request(app)
        .post("/api/users/register")
        .send({
            name: "Test User",
            email: uniqueEmail, // Use unique email
            password: "Test1234!",
            role: "user" // Ensure role is included
        });

    console.log("Register Response:", res.body); // Debugging

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");
  });

  test("✅ User should log in", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: uniqueEmail, // Use same email as registered
        password: "Test1234!"
      });

    console.log("Login Response:", res.body); // Debugging

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("✅ User should retrieve profile", async () => {
    const loginRes = await request(app)
        .post("/api/users/login")
        .send({
            email: uniqueEmail,
            password: "Test1234!"
        });

    expect(loginRes.statusCode).toBe(200);
    const token = loginRes.body.token; // Get token

    const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`); // Send token

    console.log("Profile Response:", res.body); // Debugging

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email");
  });

  test("❌ User should not access profile without token", async () => {
    const res = await request(app).get("/api/users/me");

    console.log("Unauthorized Profile Response:", res.body); // Debugging

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Not authorized, no token");
  });
});
