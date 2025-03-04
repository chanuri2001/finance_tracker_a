const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const { generateToken } = require("../utils/jwtUtils");

describe("🔹 Budget API Tests", () => {
  let userToken, budgetId;

  beforeAll(async () => {
    const user = { _id: new mongoose.Types.ObjectId().toString(), role: "user" };
    userToken = generateToken(user._id);
  });

  test("✅ User should create a budget", async () => {
    const res = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        category: "Food",
        amount: 500,  // ✅ Correct field name
        month: "March",  // ✅ Correct field name
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    budgetId = res.body._id;
  });

  test("✅ User should retrieve budgets", async () => {
    const res = await request(app)
      .get("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("✅ User should update a budget", async () => {
    const res = await request(app)
      .put(`/api/budgets/${budgetId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ amount: 600 });  // ✅ Updated field

    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBe(600);
  });

  test("✅ User should delete a budget", async () => {
    const res = await request(app)
      .delete(`/api/budgets/${budgetId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Budget deleted successfully");
  });

  test("❌ User should not update a non-existent budget", async () => {
    const invalidId = new mongoose.Types.ObjectId().toString(); // ✅ Generates a valid but non-existent ID

    const res = await request(app)
      .put(`/api/budgets/${invalidId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ amount: 700 });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Budget not found");
  });

  test("❌ User should get an error for invalid budget ID format", async () => {
    const res = await request(app)
      .put(`/api/budgets/invalidid`)  // ❌ This is not a valid MongoDB ID
      .set("Authorization", `Bearer ${userToken}`)
      .send({ amount: 700 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid budget ID format");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
