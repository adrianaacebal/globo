// CRUD de riders, coupons, orders y reviews + filtros ?search= y ?delivery= del recurso principal
const request = require("supertest");
const app = require("../src/app");

const fields = (res) => res.body.errors.map((e) => e.field);

// Prueba el CRUD completo de un recurso: POST -> GET /:id -> PUT -> DELETE -> GET 404
function crudSuite(path, valid, replacement, invalid, invalidFields) {
  describe(`CRUD ${path}`, () => {
    test("GET list -> 200 array", async () => {
      const res = await request(app).get(path);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /stats -> 200", async () => {
      const res = await request(app).get(`${path}/stats`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("total");
    });

    test("POST -> 201 + Location, then GET, PUT, DELETE", async () => {
      const created = await request(app).post(path).send({ ...valid, id: 999, unknown: "x" });
      expect(created.status).toBe(201);
      expect(created.body).not.toHaveProperty("unknown");
      expect(created.body.id).not.toBe(999);
      expect(created.headers.location).toBe(`${path}/${created.body.id}`);

      const read = await request(app).get(created.headers.location);
      expect(read.status).toBe(200);

      const replaced = await request(app).put(created.headers.location).send(replacement);
      expect(replaced.status).toBe(200);
      expect(replaced.body).toMatchObject(replacement);

      const removed = await request(app).delete(created.headers.location);
      expect(removed.status).toBe(204);
      expect((await request(app).get(created.headers.location)).status).toBe(404);
    });

    test("POST invalid -> 400 with every error at once", async () => {
      const res = await request(app).post(path).send(invalid);
      expect(res.status).toBe(400);
      expect(fields(res)).toEqual(expect.arrayContaining(invalidFields));
    });

    test("PUT / DELETE an id that does not exist -> 404", async () => {
      expect((await request(app).put(`${path}/9999`).send(valid)).status).toBe(404);
      expect((await request(app).delete(`${path}/9999`)).status).toBe(404);
    });
  });
}

crudSuite(
  "/api/riders",
  { name: "Test Rider", vehicle: "bike", area: "Centro", available: true, rating: 4.5 },
  { name: "Test Rider", vehicle: "car", area: "Retiro", available: false, rating: 3 },
  { name: "", vehicle: "plane", available: "yes", rating: 9 },
  ["name", "vehicle", "area", "available", "rating"]
);

crudSuite(
  "/api/coupons",
  { code: "test10", percent: 10, active: true, orderType: "all" },
  { code: "TEST10", percent: 25, active: false, orderType: "pickup" },
  { code: "x", percent: 150, active: "no", orderType: "always" },
  ["code", "percent", "active", "orderType"]
);

crudSuite(
  "/api/orders",
  { customer: "Test Customer", restaurantId: 1, riderId: 2, type: "delivery", status: "pending", total: 12.5, paid: false },
  { customer: "Test Customer", restaurantId: 2, riderId: null, type: "pickup", status: "delivered", total: 20, paid: true },
  { customer: "", restaurantId: "abc", type: "boat", status: "lost", total: -1, paid: 1 },
  ["customer", "restaurantId", "type", "status", "total", "paid"]
);

crudSuite(
  "/api/reviews",
  { restaurantId: 4, author: "Test Author", rating: 4, comment: "Very good burgers.", verified: false },
  { restaurantId: 5, author: "Test Author", rating: 2, comment: "Changed my mind.", verified: true },
  { restaurantId: 0, author: "", rating: 6, comment: "no", verified: "true" },
  ["restaurantId", "author", "rating", "comment", "verified"]
);

describe("Relations and duplicates", () => {
  test("a review for a restaurant that does not exist -> 400", async () => {
    const res = await request(app).post("/api/reviews").send({
      restaurantId: 9999, author: "Zoe", rating: 5, comment: "Great!", verified: false,
    });
    expect(res.status).toBe(400);
    expect(fields(res)).toContain("restaurantId");
  });

  test("an order for a restaurant that does not exist -> 400", async () => {
    const res = await request(app).post("/api/orders").send({
      customer: "Zoe", restaurantId: 9999, riderId: null, type: "pickup", status: "pending", total: 5, paid: false,
    });
    expect(res.status).toBe(400);
    expect(fields(res)).toContain("restaurantId");
  });

  test("a coupon code that already exists -> 409", async () => {
    const res = await request(app).post("/api/coupons").send({ code: "globo20", percent: 5, active: true, orderType: "all" });
    expect(res.status).toBe(409);
  });
});

describe("Filtered endpoint on the main resource (restaurants)", () => {
  test("?search= is case-insensitive and combines with ?delivery=", async () => {
    const res = await request(app).get("/api/restaurants?search=MONTECARMELO&delivery=false");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((r) => r.area === "Fuencarral" && r.delivery === false)).toBe(true);
  });

  test("no matches -> 200 with an empty array", async () => {
    const res = await request(app).get("/api/restaurants?search=zzzz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("a non-boolean flag -> 400 with the errors array", async () => {
    const res = await request(app).get("/api/restaurants?delivery=maybe");
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "delivery", message: "delivery must be true or false" }]);
  });

  test("/stats is computed on every request", async () => {
    const res = await request(app).get("/api/restaurants/stats?delivery=true");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(res.body.withDelivery);
  });
});
