const request = require("supertest");
const app = require("../server");
const { generateToken } = require("../utils/jwtUtils");

describe("🔹 Transactions API Tests", () => {
  let userToken, transactionId;

  beforeAll(async () => {
    const user = { _id: "604cb554311d68f491ba5781", role: "user" };
    userToken = generateToken(user._id);
  });

  test("✅ User should add a transaction", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        amount: 100,
        type: "expense",
        category: "Food",
        date: "2025-01-01",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    transactionId = res.body._id;
  });

  test("✅ User should retrieve transactions", async () => {
    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("✅ User should update a transaction", async () => {
    const res = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ amount: 150 });

    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBe(150);
  });

  test("✅ User should delete a transaction", async () => {
    const res = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Transaction deleted successfully");
  });

  test("❌ User should not update a non-existent transaction", async () => {
    const res = await request(app)
      .put(`/api/transactions/invalidid`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ amount: 200 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid transaction ID format");
  });
});
