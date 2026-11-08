// CRUD /api/dishes tested in-process with supertest (no server to start).
const request = require("supertest");
const app = require("../src/app");

// Los 400 traen { errors: [ { field, message } ] }: nos quedamos con los nombres de los campos
const fields = (res) => res.body.errors.map((e) => e.field);

const valid = { name: "Veggie Wrap", brand: "honestgreens", category: "main", price: 9.5 };

describe("GET /api/dishes", () => {
  test("200 + array of dishes", async () => {
    const res = await request(app).get("/api/dishes");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("400 if minPrice > maxPrice", async () => {
    const res = await request(app).get("/api/dishes?minPrice=10&maxPrice=5");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/dishes/:id", () => {
  test("200 + the one dish", async () => {
    const res = await request(app).get("/api/dishes/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test("404 if no dish has that id", async () => {
    const res = await request(app).get("/api/dishes/9999");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/dishes", () => {
  test("201 + Location header + created dish", async () => {
    const res = await request(app).post("/api/dishes").send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(valid);
    expect(res.headers.location).toBe(`/api/dishes/${res.body.id}`);
  });

  test("409 if the brand already has a dish with that name", async () => {
    const res = await request(app).post("/api/dishes").send(valid); // created in the test above
    expect(res.status).toBe(409);
  });

  test("400 if price is not a number", async () => {
    const res = await request(app).post("/api/dishes").send({ ...valid, price: "free" });
    expect(res.status).toBe(400);
    expect(fields(res)).toContain("price");
  });
});

describe("PUT /api/dishes/:id", () => {
  test("200 + the fully-replaced dish", async () => {
    const replacement = { ...valid, name: "Replaced Dish" };
    const res = await request(app).put("/api/dishes/2").send(replacement);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, ...replacement });
  });

  test("400 if a field is missing", async () => {
    const res = await request(app).put("/api/dishes/2").send({ name: "Only name" });
    expect(res.status).toBe(400);
  });

  test("404 if not found", async () => {
    const res = await request(app).put("/api/dishes/9999").send(valid);
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/dishes/:id", () => {
  test("204 with empty body, then 404", async () => {
    const created = await request(app).post("/api/dishes").send({ ...valid, name: "To Delete" });
    expect(created.status).toBe(201);
    const res = await request(app).delete(created.headers.location);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect((await request(app).get(created.headers.location)).status).toBe(404);
  });

  test("404 if no dish has that id", async () => {
    const res = await request(app).delete("/api/dishes/9999");
    expect(res.status).toBe(404);
  });
});
