const request = require("supertest");
const app = require("../server");
const Goal = require("../models/Goal");
const { generateToken } = require("../utils/jwtUtils");

describe("🔹 Goals & Savings API Tests", () => {
  let userToken, goalId;

  beforeAll(async () => {
    const user = {
      _id: "604cb554311d68f491ba5781",
      name: "Test User",
      email: "testuser@example.com",
      role: "user",
    };

    userToken = generateToken(user._id);
  });

  test("✅ User should create a goal", async () => {
    const res = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Save for Vacation",
        targetAmount: 3000,
        deadline: "2025-12-31",
        autoAllocate: true,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    goalId = res.body._id;
  });

  test("✅ User should retrieve goals", async () => {
    const res = await request(app)
      .get("/api/goals")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("✅ User should update goal progress", async () => {
    const res = await request(app)
      .put(`/api/goals/${goalId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ savedAmount: 500 });

    expect(res.statusCode).toBe(200);
    expect(res.body.savedAmount).toBe(500);
  });

  test("✅ User should delete a goal", async () => {
    const res = await request(app)
      .delete(`/api/goals/${goalId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Goal deleted successfully");
  });

  test("❌ User should not update a non-existent goal", async () => {
    const res = await request(app)
      .put(`/api/goals/invalidgoalid`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ savedAmount: 500 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid goal ID format");
  });
});
