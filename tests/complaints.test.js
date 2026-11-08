// CRUD /api/complaints tested in-process with supertest (no server to start).
const request = require("supertest");
const app = require("../src/app");

const valid = {
  name: "Eva Test",
  email: "eva@example.com",
  brand: "telepizza",
  type: "food",
  date: "2026-11-01",
  message: "The pizza had far too much salt.",
};

describe("GET /api/complaints", () => {
  test("200 + array of complaints", async () => {
    const res = await request(app).get("/api/complaints");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("filters by status", async () => {
    const res = await request(app).get("/api/complaints?status=open");
    expect(res.status).toBe(200);
    expect(res.body.every((c) => c.status === "open")).toBe(true);
  });

  test("400 on an invalid filter", async () => {
    const res = await request(app).get("/api/complaints?status=closed");
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("status");
  });

  test("stats count by status", async () => {
    const res = await request(app).get("/api/complaints/stats");
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body).toHaveProperty("byStatus");
  });
});

describe("POST /api/complaints", () => {
  test("201 + Location + status defaults to open + email lowercased", async () => {
    const res = await request(app).post("/api/complaints").send({ ...valid, email: "EVA@Example.com", id: 99, extra: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...valid, status: "open" });
    expect(res.body.id).not.toBe(99);
    expect(res.body).not.toHaveProperty("extra");
    expect(res.headers.location).toBe(`/api/complaints/${res.body.id}`);
  });

  test("400 with every error at once", async () => {
    const res = await request(app).post("/api/complaints").send({ email: "nope", date: "2999-01-01" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors)).toEqual(
      expect.arrayContaining(["name", "email", "brand", "type", "date", "message"])
    );
    expect(res.body.errors.date).toMatch(/future/);
  });
});

describe("GET / PUT / PATCH / DELETE /api/complaints/:id", () => {
  test("GET 200, 404 and 400", async () => {
    expect((await request(app).get("/api/complaints/1")).status).toBe(200);
    expect((await request(app).get("/api/complaints/9999")).status).toBe(404);
    expect((await request(app).get("/api/complaints/abc")).status).toBe(400);
  });

  test("PUT replaces the complaint and keeps createdAt", async () => {
    const before = (await request(app).get("/api/complaints/2")).body;
    const res = await request(app).put("/api/complaints/2").send({ ...valid, status: "resolved" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, ...valid, status: "resolved", createdAt: before.createdAt });
  });

  test("PATCH changes only the status", async () => {
    const before = (await request(app).get("/api/complaints/3")).body;
    const res = await request(app).patch("/api/complaints/3").send({ status: "in progress" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...before, status: "in progress" });
  });

  test("DELETE 204 then 404", async () => {
    const created = await request(app).post("/api/complaints").send(valid);
    expect((await request(app).delete(created.headers.location)).status).toBe(204);
    expect((await request(app).get(created.headers.location)).status).toBe(404);
  });
});
