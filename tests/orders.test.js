// CRUD /api/orders and the checkout (POST /orders) tested in-process with supertest.
const request = require("supertest");
const app = require("../src/app");

const valid = {
  email: "phone@example.com",
  brand: "telepizza",
  area: "Retiro",
  type: "pickup",
  payment: "cash",
  total: 15.5,
};

describe("GET /api/orders", () => {
  test("filters by status and total", async () => {
    const res = await request(app).get("/api/orders?status=pending&maxTotal=10");
    expect(res.status).toBe(200);
    expect(res.body.every((o) => o.status === "pending" && o.total <= 10)).toBe(true);
  });

  test("400 if minTotal > maxTotal", async () => {
    const res = await request(app).get("/api/orders?minTotal=50&maxTotal=10");
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("minTotal");
  });

  test("stats: revenue and counts", async () => {
    const res = await request(app).get("/api/orders/stats");
    expect(res.status).toBe(200);
    expect(res.body.revenue).toBeGreaterThan(0);
    expect(res.body).toHaveProperty("byStatus");
  });
});

describe("POST /api/orders", () => {
  test("201 + status defaults to pending + server fields", async () => {
    const res = await request(app).post("/api/orders").send({ ...valid, userId: 1, items: ["ignored"] });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...valid, status: "pending", items: [], userId: null });
    expect(res.headers.location).toBe(`/api/orders/${res.body.id}`);
  });

  test("400 with every error at once", async () => {
    const res = await request(app).post("/api/orders").send({ payment: "bitcoin", total: -1 });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors)).toEqual(
      expect.arrayContaining(["email", "brand", "area", "type", "payment", "total"])
    );
  });
});

describe("GET / PUT / PATCH / DELETE /api/orders/:id", () => {
  test("GET 200 and 404", async () => {
    expect((await request(app).get("/api/orders/1")).status).toBe(200);
    expect((await request(app).get("/api/orders/9999")).status).toBe(404);
  });

  test("PUT keeps the items and date from the checkout", async () => {
    const before = (await request(app).get("/api/orders/1")).body;
    const res = await request(app).put("/api/orders/1").send({ ...valid, status: "delivered" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ...valid, status: "delivered", items: before.items, date: before.date });
  });

  test("PATCH changes only the status", async () => {
    const before = (await request(app).get("/api/orders/2")).body;
    const res = await request(app).patch("/api/orders/2").send({ status: "cancelled" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...before, status: "cancelled" });
  });

  test("DELETE 204 then 404", async () => {
    const created = await request(app).post("/api/orders").send(valid);
    expect((await request(app).delete(created.headers.location)).status).toBe(204);
    expect((await request(app).get(created.headers.location)).status).toBe(404);
  });
});

describe("Checkout: POST /orders saves into /api/orders", () => {
  test("the order appears in /api/orders and in the user's history", async () => {
    const login = await request(app)
      .post("/login")
      .send({ name: "Alice", email: "alice@example.com", password: "password123" });
    const auth = { Authorization: `Bearer ${login.body.token}` };

    const placed = await request(app)
      .post("/orders")
      .set(auth)
      .send({
        password: "password123",
        restaurant: "Telepizza",
        location: "Centro",
        type: "delivery",
        payment: "card",
        travelMinutes: 10,
        items: [{ dish: "Pepperoni Pizza", quantity: 1 }],
      });
    expect(placed.status).toBe(201);
    expect(placed.body.order).toMatchObject({ brand: "telepizza", area: "Centro", status: "pending", total: 9.45 });

    const admin = await request(app).get(`/api/orders/${placed.body.order.id}`);
    expect(admin.status).toBe(200);

    const history = await request(app).get("/orders").set(auth);
    expect(history.body[0].id).toBe(placed.body.order.id);
  });

  test("400 with every error if area, type and payment are wrong", async () => {
    const login = await request(app)
      .post("/login")
      .send({ name: "Bob", email: "bob@example.com", password: "password456" });
    const res = await request(app)
      .post("/orders")
      .set({ Authorization: `Bearer ${login.body.token}` })
      .send({ password: "password456", restaurant: "Telepizza", location: "Paris", type: "x", payment: "x", items: [] });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors)).toEqual(["location", "type", "payment"]);
  });
});
