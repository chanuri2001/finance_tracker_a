const request = require("supertest");
const app = require("../server");
const { generateToken } = require("../utils/jwtUtils");

describe("🔹 Reports API Tests", () => {
  let userToken;

  beforeAll(async () => {
    const user = { _id: "604cb554311d68f491ba5781", role: "user" };
    userToken = generateToken(user._id);
  });

  test("✅ User should get a financial report", async () => {
    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${userToken}`)
      .query({ period: "monthly" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("income");
    expect(res.body).toHaveProperty("expense");
  });
});
