// CRUD /api/restaurants tested in-process with supertest (no server to start).
const request = require("supertest");
const app = require("../src/app");

// Los 400 traen { errors: [ { field, message } ] }: nos quedamos con los nombres de los campos
const fields = (res) => res.body.errors.map((e) => e.field);

const valid = {
  name: "Telepizza Test",
  brand: "telepizza",
  area: "Centro",
  type: "pizza",
  delivery: true,
  lat: 40.42,
  lon: -3.7,
};

describe("GET /api/restaurants", () => {
  test("200 + array of restaurants", async () => {
    const res = await request(app).get("/api/restaurants");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("filters by brand", async () => {
    const res = await request(app).get("/api/restaurants?brand=sushita");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((r) => r.brand === "sushita")).toBe(true);
  });

  test("400 on an invalid filter", async () => {
    const res = await request(app).get("/api/restaurants?brand=kfc");
    expect(res.status).toBe(400);
    expect(fields(res)).toContain("brand");
  });
});

describe("GET /api/restaurants/:id", () => {
  test("200 + the one restaurant", async () => {
    const res = await request(app).get("/api/restaurants/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test("404 if no restaurant has that id", async () => {
    const res = await request(app).get("/api/restaurants/9999");
    expect(res.status).toBe(404);
  });

  test("400 if the id is not a positive integer", async () => {
    const res = await request(app).get("/api/restaurants/abc");
    expect(res.status).toBe(400);
  });
});

describe("POST /api/restaurants", () => {
  test("201 + Location header + created restaurant", async () => {
    const res = await request(app).post("/api/restaurants").send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(valid);
    expect(res.headers.location).toBe(`/api/restaurants/${res.body.id}`);

    const read = await request(app).get(res.headers.location);
    expect(read.status).toBe(200);
    expect(read.body).toEqual(res.body);
  });

  test("400 if the body is empty", async () => {
    const res = await request(app).post("/api/restaurants").send({});
    expect(res.status).toBe(400);
    expect(fields(res)).toEqual(
      expect.arrayContaining(["name", "brand", "area", "type", "delivery", "lat", "lon"])
    );
  });

  test("400 if a field is invalid", async () => {
    const res = await request(app).post("/api/restaurants").send({ ...valid, lat: 200 });
    expect(res.status).toBe(400);
    expect(fields(res)).toContain("lat");
  });
});

describe("PUT / PATCH /api/restaurants/:id", () => {
  test("PUT 200 replaces the whole restaurant", async () => {
    const res = await request(app).put("/api/restaurants/2").send(valid);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, ...valid });
  });

  test("PUT 400 if a required field is missing", async () => {
    const { lon, ...partial } = valid;
    const res = await request(app).put("/api/restaurants/2").send(partial);
    expect(res.status).toBe(400);
    expect(fields(res)).toContain("lon");
  });

  test("PUT 404 if not found", async () => {
    const res = await request(app).put("/api/restaurants/9999").send(valid);
    expect(res.status).toBe(404);
  });

  test("PATCH 200 changes only the fields sent", async () => {
    const before = (await request(app).get("/api/restaurants/3")).body;
    const res = await request(app).patch("/api/restaurants/3").send({ name: "Renamed" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...before, name: "Renamed" });
  });
});

describe("DELETE /api/restaurants/:id", () => {
  test("204 with empty body, then 404", async () => {
    const created = await request(app).post("/api/restaurants").send(valid);
    const res = await request(app).delete(created.headers.location);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");

    const again = await request(app).get(created.headers.location);
    expect(again.status).toBe(404);
  });

  test("404 if no restaurant has that id", async () => {
    const res = await request(app).delete("/api/restaurants/9999");
    expect(res.status).toBe(404);
  });
});
